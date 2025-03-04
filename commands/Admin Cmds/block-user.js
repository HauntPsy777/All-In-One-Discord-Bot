const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const VerificationDB = require("../../db/verified-db");

module.exports = {
  name: "sos",
  aliases: ["sus", "block-verify"],
  usage: "block-user <@user/id> [reason]",
  description: "Block a user from verification.\nUsage: `block-user <@user/id> [reason]`",
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
        (await message.guild.members.fetch(args[0]).catch(() => null));
      if (!target) {
        const embed = new EmbedBuilder().setDescription(
          "❌ Please mention a user or provide their ID!"
        );
        return message.channel.send({ embeds: [embed] });
      }

      // Get reason (optional)
      const reason = args.slice(1).join(" ") || "No reason provided";

      // Check if user is already blacklisted
      const isAlreadyBlacklisted = await VerificationDB.isBlacklisted(
        message.guild.id,
        target.id
      );
      if (isAlreadyBlacklisted) {
        const embed = new EmbedBuilder().setDescription(
          `❌ ${target} is already blocked from verification!`
        );
        return message.channel.send({ embeds: [embed] });
      }

      // Check if user is already verified
      const isVerified = await VerificationDB.isVerified(
        message.guild.id,
        target.id
      );
      if (isVerified) {
        const embed = new EmbedBuilder().setDescription(
          `❌ ${target} is already verified and cannot be blocked!`
        );
        return message.channel.send({ embeds: [embed] });
      }

      // Add user to blacklist
      await VerificationDB.addToBlacklist(message.guild.id, target.id, reason);

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setDescription(
          `✅ ${target} has been blocked from verification.
               
Reason: ${reason}`
        )
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      // Send success message
      await message.reply({ embeds: [successEmbed] });

      // Log the blacklist action
      const roles = await VerificationDB.getRoles(message.guild.id);
      if (roles && roles.verification_logs) {
        const logChannel = message.guild.channels.cache.get(
          roles.verification_logs
        );
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("User Blocked")
            .setDescription(
              `
**User:** ${target} (${target.id})
**Blocked By:** ${message.author} (${message.author.id})

**Reason:** ${reason}`
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error("Block User Error:", error);
      const embed = new EmbedBuilder().setDescription(
        "❌ An error occurred while blocking the user. Please check my permissions and try again."
      );
      message.reply({ embeds: [embed] });
    }
  },
};