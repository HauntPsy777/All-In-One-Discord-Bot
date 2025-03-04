const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const RoomSetupDB = require("../db/room-setup-db");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    try {
      // Fetch guild settings
      const settings = await RoomSetupDB.getSettings(newState.guild.id);
      if (!settings) return;

      const logChannel = newState.guild.channels.cache.get(
        settings.log_channel
      );
      if (!logChannel) return;

      // Room Creation Logic
      if (newState.channelId === settings.join_channel) {
        // Find the next available room number
        const existingRooms = newState.guild.channels.cache.filter(
          (channel) =>
            channel.parentId === settings.room_category &&
            channel.type === ChannelType.GuildVoice &&
            channel.name.startsWith("Need Help ")
        );

        const roomNumber = existingRooms.size + 1;

        // Create personal room
        const personalRoom = await newState.guild.channels.create({
          name: `Need Help ${roomNumber}`,
          type: ChannelType.GuildVoice,
          parent: settings.room_category,
          userLimit: 0, // Unlimited users
          permissionOverwrites: [
            {
              id: newState.member.id,
              allow: [PermissionFlagsBits.Connect],
            },
            {
              id: settings.staff_role,
              allow: [
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.MuteMembers,
              ],
            },
            {
              id: settings.unverified_role, // Deny unverified_role access
              deny: [
                PermissionFlagsBits.Connect, // Deny connection
                PermissionFlagsBits.ViewChannel, // Deny viewing the channel
              ],
            },
            {
              id: newState.guild.id,
              deny: [PermissionFlagsBits.Connect],
            },
          ],
        });

        // Move user to new room
        try {
          await newState.member.voice.setChannel(personalRoom);
        } catch (moveError) {
          console.error("Error moving user to personal room:", moveError);
        }

        // Single embed for room creation
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setAuthor({
            name: `・${newState.guild.name} | Support Room Created`,
            iconURL: newState.member.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `**User:**
           ・ ${newState.member} | \`${newState.member.id}\``
          )
          .setThumbnail(
            `${newState.member.user.displayAvatarURL({ dynamic: true })}`
          )
          .setFooter({ text: newState.guild.name })
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      // Personal Room Management Logic
      if (oldState.channel) {
        // Safely check if the channel name includes "Need Help"
        const channelName = oldState.channel.name || "";
        if (channelName.startsWith("Need Help ")) {
          // Check if the room is empty
          if (oldState.channel.members.size === 0) {
            try {
              // Single embed for room deletion
              const embed = new EmbedBuilder()
                .setColor("Red")
                .setAuthor({
                  name: `・${newState.guild.name} | Support Room Deleted`,
                  iconURL: oldState.member.user.displayAvatarURL({
                    dynamic: true,
                  }),
                })
                .setDescription(
                  `**User:**
                  ➜ ${newState.member} | \`${newState.member.id}\``
                )
                .setThumbnail(
                  `${newState.member.user.displayAvatarURL({ dynamic: true })}`
                )
                .setFooter({ text: oldState.guild.name })
                .setTimestamp();

              await oldState.channel.delete("Room is empty");
              await logChannel.send({ embeds: [embed] });
            } catch (deleteError) {
              console.error("Error deleting empty room:", deleteError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in voice state update:", error);
    }
  },
};
