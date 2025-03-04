const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const jailDB = require("../../db/jail-db.js");

module.exports = {
  name: "jail",
  description: "Jail a user.\nUsage: `jail <@user> [reason]`",
  async execute(message, args) {
    // Ensure the user has Administrator permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Permission Denied")
            .setDescription("❌ You need Administrator permissions to use this command.")
            .setColor("Red"),
        ],
      });
    }

    // Get the user to jail
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Invalid User")
            .setDescription("❌ Please mention a user to jail.")
            .setColor("Red"),
        ],
      });
    }

    const guildMember = await message.guild.members.fetch(target.id).catch((err) => {
      console.error(err);
      return null;
    });

    if (!guildMember) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Not Found")
            .setDescription("❌ Could not fetch the user from the server.")
            .setColor("Red"),
        ],
      });
    }

    // Get jail system settings from the database
    const settings = await jailDB.getSettings(message.guild.id);
    if (!settings) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Jail System Not Set Up")
            .setDescription("❌ Please run the `/setupjail` command to set up the jail system.")
            .setColor("Red"),
        ],
      });
    }

    const { jailed_role_id, jailer_role_id, logs_channel_id } = settings;
    const jailedRoleObject = message.guild.roles.cache.get(jailed_role_id);
    const jailerRoleObject = message.guild.roles.cache.get(jailer_role_id);

    // Check if the roles are valid
    if (!jailedRoleObject) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Invalid Jailed Role")
            .setDescription("❌ The specified jailed role does not exist in this server.")
            .setColor("Red"),
        ],
      });
    }

    if (!jailerRoleObject) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Invalid Jail Role")
            .setDescription("❌ The specified jailer role does not exist in this server.")
            .setColor("Red"),
        ],
      });
    }

    // Check if the member has the jailer role or is an administrator
    if (
      !message.member.roles.cache.has(jailerRoleObject.id) &&
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Permission Denied")
            .setDescription("❌ You need the Jail role or Administrator permissions to jail someone.")
            .setColor("Red"),
        ],
      });
    }

    // Check if the user is already jailed
    if (guildMember.roles.cache.has(jailedRoleObject.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Already Jailed")
            .setDescription(`❌ ${guildMember.user.tag} is already jailed.`)
            .setColor("Red"),
        ],
      });
    }

    // Remove all roles from the user except for @everyone
    const rolesToRemove = guildMember.roles.cache.filter(
      (role) => role.id !== message.guild.id
    ); // Filter out @everyone role
    await guildMember.roles.remove(rolesToRemove).catch((err) => {
      console.error(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("❌ An error occurred while removing roles.")
            .setColor("Red"),
        ],
      });
    });

    // Jail the user by adding the jailed role
    await guildMember.roles.add(jailedRoleObject).catch((err) => {
      console.error(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("❌ An error occurred while adding the jailed role.")
            .setColor("Red"),
        ],
      });
    });

    const successEmbed = new EmbedBuilder()
      .setDescription(`✅ Successfully jailed ${guildMember.user.tag}`)
      .setColor("Green");

    await message.reply({ embeds: [successEmbed] });

    // Calculate the time jailed (e.g., in hours ago)
    const timeJailed = new Date() - guildMember.joinedAt; // Calculate the time since they were jailed
    const timeJailedFormatted = `${Math.floor(
      timeJailed / (1000 * 60 * 60)
    )} hours ago`; // Time in hours

    // Get the reason (if provided) or use default
    const reason = args.slice(1).join(" ") || "No reason provided";

    // Send a log message to the logs channel
    const channel = message.guild.channels.cache.get(logs_channel_id);
    if (channel && channel.isTextBased()) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Member Has Been Jailed",
          iconURL: guildMember.user.displayAvatarURL({
            dynamic: true,
            size: 32,
          }), // User's avatar as icon
        })
        .setDescription(`✅ <@${guildMember.user.id}> has been successfully jailed.`)
        .setThumbnail(`${guildMember.user.displayAvatarURL({ dynamic: true })}`)
        .setColor("Red")
        .addFields(
          {
            name: "Jailed User",
            value: `⟿ <@${guildMember.user.id}> | ${guildMember.user.id}`,
          },
          {
            name: "Jailed By",
            value: `⟿ <@${message.author.id}> | ${message.author.id}`,
          },
          { name: "Jailed Since", value: `⟿ \`${timeJailedFormatted}\`` },
          { name: "Reason", value: `⟿ \`${reason}\`` }
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${message.author.tag} ・User ➡ ${message.author.username}#${message.author.discriminator}`,
        });

      await channel.send({ embeds: [logEmbed] });
    } else {
      console.error("Logs channel not found or is not a text-based channel.");
    }
  },
};