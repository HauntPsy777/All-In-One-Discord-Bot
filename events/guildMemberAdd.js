const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const antiBotDB = require("../db/botDB");
const roleSetupDB = require("../db/role-role-db");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      const guild = member.guild;

      // Fetch the latest audit logs to check who added the bot
      const auditLogs = await guild.fetchAuditLogs({ type: 28, limit: 1 });
      const botAddedLog = auditLogs.entries.first();

      const settings = await antiBotDB.getSettings(guild.id);
      if (!settings || !settings.is_enabled) return;

      const logChannel = guild.channels.cache.get(settings.log_channel) || guild.systemChannel;
      if (!logChannel) return;

      // Check if the new member is a bot
      if (member.user.bot) {
        let addedBy = botAddedLog ? `<@${botAddedLog.executor.id}>` : "Unknown (Manual Invite)";

        // Ensure bot has permissions to kick members
        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          console.warn(`⚠️ Missing "Kick Members" permission in guild: ${guild.name} (${guild.id})`);
          return;
        }

        try {
          // Kick the unauthorized bot
          await member.kick("Anti-Bot: Unauthorized bot detected.");
          console.log(`✅ Kicked unauthorized bot: ${member.user.tag} from guild: ${guild.name}`);

          // Create embed log
          const botKickEmbed = new EmbedBuilder()
            .setTitle("🚨 Unauthorized Bot Kicked!")
            .setDescription(`A bot was **kicked** due to **Anti-Bot protection**.`)
            .addFields(
              { name: "🤖 Bot", value: `<@${member.user.id}>`, inline: true },
              { name: "🆔 Bot ID", value: `\`${member.user.id}\``, inline: true },
              { name: "🔹 Added By", value: addedBy, inline: true },
              { name: "📅 Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setColor("Red")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

          await logChannel.send({ embeds: [botKickEmbed] });
        } catch (kickError) {
          console.error(`❌ Failed to kick bot ${member.user.tag}:`, kickError);

          // Log failure
          const failEmbed = new EmbedBuilder()
            .setTitle("⚠️ Anti-Bot Failed!")
            .setDescription(`The bot **${member.user.tag}** could not be kicked.`)
            .addFields(
              { name: "🔹 Bot", value: `<@${member.user.id}>`, inline: true },
              { name: "🔹 Bot ID", value: `\`${member.user.id}\``, inline: true },
              { name: "🔹 Added By", value: addedBy, inline: true },
              { name: "❌ Error", value: `\`${kickError.message}\``, inline: false }
            )
            .setColor("Yellow")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

          await logChannel.send({ embeds: [failEmbed] });
        }
        return;
      }

      // Assign Auto-Role
      const autoRoleId = await roleSetupDB.getAutoRole(guild.id);
      if (autoRoleId) {
        const role = guild.roles.cache.get(autoRoleId);
        if (role) {
          await member.roles.add(role, "Auto-role assignment on join");
          console.log(`✅ Assigned auto role to ${member.user.tag} in guild: ${guild.name}`);

          // Fetch log channel
          const logChannelId = await antiBotDB.getLogChannel(guild.id);
          const logChannel = guild.channels.cache.get(logChannelId) || guild.systemChannel;

          if (logChannel) {
            const autoRoleEmbed = new EmbedBuilder()
              .setTitle("✅ Auto-Role Assigned")
              .setDescription(`A new user has joined and was assigned a role.`)
              .addFields(
                { name: "👤 User", value: `<@${member.user.id}>`, inline: true },
                { name: "🆔 User ID", value: `\`${member.user.id}\``, inline: true },
                { name: "📌 Assigned Role", value: `<@&${role.id}>`, inline: true },
                { name: "📅 Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
              )
              .setColor("Green")
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp();

            await logChannel.send({ embeds: [autoRoleEmbed] });
          }
        } else {
          console.warn(`⚠️ Role with ID ${autoRoleId} not found in guild: ${guild.name}`);
        }
      }

      // Log user join event
      const userJoinEmbed = new EmbedBuilder()
        .setTitle("✅ New User Joined")
        .setDescription(`A new user has joined the server.`)
        .addFields(
          { name: "👤 User", value: `<@${member.user.id}>`, inline: true },
          { name: "🆔 User ID", value: `\`${member.user.id}\``, inline: true },
          { name: "📅 Joined At", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor("Blue")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await logChannel.send({ embeds: [userJoinEmbed] });

    } catch (error) {
      console.error("❌ Error in guildMemberAdd event handler:", error);
    }
  },
};
