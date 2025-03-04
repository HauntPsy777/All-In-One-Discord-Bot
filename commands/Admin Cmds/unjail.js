const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const jailDB = require("../../db/jail-db.js");
const VerificationDB = require("../../db/verified-db");

module.exports = {
  name: "unjail",
  description: "Unjail a user.\nUsage: `unjail <@user/userID>`",
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

    // Get the user to unjail
    const target = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Invalid User")
            .setDescription("❌ Please mention a user or provide their ID to unjail.")
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

    if (!jailedRoleObject || !jailerRoleObject) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Role Error")
            .setDescription("❌ One or more jail system roles are missing.")
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
            .setDescription("❌ You need the Jail role or Administrator permissions to unjail someone.")
            .setColor("Red"),
        ],
      });
    }

    // Remove the jailed role from the user
    await guildMember.roles.remove(jailedRoleObject).catch((err) => {
      console.error(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("❌ An error occurred while removing the jailed role.")
            .setColor("Red"),
        ],
      });
    });

    // Get verified role from the verification database
    const roles = await VerificationDB.getRoles(message.guild.id);
    if (!roles || !roles.verified_role) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Verification system is not properly set up. Verified role is missing.")
            .setColor("Red"),
        ],
      });
    }

    const verifiedRole = message.guild.roles.cache.get(roles.verified_role);
    if (!verifiedRole) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ The verified role does not exist.")
            .setColor("Red"),
        ],
      });
    }

    // Add the verified role to the user
    await guildMember.roles.add(verifiedRole).catch((err) => {
      console.error(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("❌ An error occurred while adding the verified role.")
            .setColor("Red"),
        ],
      });
    });

    // Add user to verified database
    await VerificationDB.addVerifiedUser(
      message.guild.id,
      guildMember.id,
      guildMember.user.username,
      message.author.id,
      "verified"
    );

    const successEmbed = new EmbedBuilder()
      .setDescription(`✅ Successfully unjailed ${guildMember.user.tag}`)
      .setColor("Green");

    await message.reply({ embeds: [successEmbed] });

    // Send a log message to the logs channel
    const channel = message.guild.channels.cache.get(logs_channel_id);
    if (channel && channel.isTextBased()) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Member Has Been Unjailed & Verified",
          iconURL: guildMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`✅ <@${guildMember.user.id}> has been successfully unjailed`)
        .setColor("Green")
        .addFields(
          {
            name: "Unjailed User",
            value: `⟿ <@${guildMember.user.id}> | ${guildMember.user.id}`,
          },
          {
            name: "Unjailed By",
            value: `⟿ <@${message.author.id}> | ${message.author.id}`,
          }
        )
        .setTimestamp();

      await channel.send({ embeds: [logEmbed] });
    } else {
      console.error("Logs channel not found or is not a text-based channel.");
    }
  },
};