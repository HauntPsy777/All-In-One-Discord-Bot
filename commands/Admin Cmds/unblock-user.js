const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const VerificationDB = require("../../db/verified-db");

module.exports = {
  name: "unsos",
  aliases: ["unsus", "unblock-verify"],
  usage: "unblock-user <@user/id>",
  description: "Remove a user from the verification blacklist.\nUsage: `unblock-user <@user/id>`",
  async execute(message, args) {
    try {
      // Check if user has proper permissions
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        const embed = new EmbedBuilder().setDescription(
          "❌ You need Manage Roles permission to use this command!"
        );
        return message.channel.send({ embeds: [embed] });
      }

      // Get target user
      const target =
  message.mentions.members.first() ||
  (await message.guild.members.fetch(args[0]).catch(() => null)); // Fixed

if (!target) {
  const embed = new EmbedBuilder()
    .setDescription("❌ Please mention a user or provide their ID!")
    .setColor(0xff0000); // Red color for errors
  return message.channel.send({ embeds: [embed] });
}

      // Check if user is actually blacklisted
      const isBlacklisted = await VerificationDB.isBlacklisted(
        message.guild.id,
        target.id
      );
      if (!isBlacklisted) {
        const embed = new EmbedBuilder().setDescription(
          `❌ ${target} is not currently blocked from verification!`
        );
        return message.channel.send({ embeds: [embed] });
      }

      // Remove user from blacklist
      await VerificationDB.removeFromBlacklist(message.guild.id, target.id);

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription(
          `✅ ${target} has been removed from the verification blacklist.`
        )
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      // Send success message
      await message.channel.send({ embeds: [successEmbed] });

      // Log the unblock action
      const roles = await VerificationDB.getRoles(message.guild.id);
      if (roles && roles.verification_logs) {
        const logChannel = message.guild.channels.cache.get(
          roles.verification_logs
        );
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("User Unblocked")
            .setDescription(
              `
**User:** ${target} (${target.id})
**Unblocked By:** ${message.author} (${message.author.id})`
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error("Unblock User Error:", error);

      // Handle errors
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription("❌ An error occurred while unblocking the user. Please check my permissions and try again.");

      message.channel.send({ embeds: [errorEmbed] });
    }
  },
};