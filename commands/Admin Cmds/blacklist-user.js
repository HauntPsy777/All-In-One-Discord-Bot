const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const BlacklistUserDB = require("../../db/blacklistuser");

module.exports = {
  name: "blacklist-add",
  description: "Blacklist a user from a role.\nUsage: `&blacklist-add <UserId> <RoleId>`",
  async execute(message, args) {
    // Check if user has Administrator permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Only administrators can use this command.")
            .setColor("Red"),
        ],
      });
    }

    // Validate arguments
    if (args.length < 2) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Usage: `&blacklist-add <UserId> <RoleId>`")
            .setColor("Red"),
        ],
      });
    }

    const userId = args[0];
    const roleId = args[1];

    try {
      // Validate user
      const targetUser = await message.guild.members.fetch(userId).catch(() => null);
      if (!targetUser) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Invalid user ID or user not found in this server.")
              .setColor("Red"),
          ],
        });
      }

      // Validate role
      const role = message.guild.roles.cache.get(roleId);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Invalid role ID.")
              .setColor("Red"),
          ],
        });
      }

      // Check if user is already blacklisted for the role
      const blacklistedRoles = await BlacklistUserDB.getBlacklistedRoles(
        message.guild.id,
        userId
      );

      if (blacklistedRoles.some((role) => role.role_id === roleId)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`❌ User is already blacklisted for role <@&${roleId}>.`)
              .setColor("Red"),
          ],
        });
      }

      // Check if user already has the role
      if (targetUser.roles.cache.has(roleId)) {
        // Remove the role immediately
        await targetUser.roles.remove(roleId);
      }

      // Add to blacklist
      await BlacklistUserDB.addBlacklistRole(message.guild.id, userId, roleId);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ User ${targetUser.user.username} blacklisted from role <@&${roleId}>.`
            )
            .setColor("Green"),
        ],
      });
    } catch (error) {
      console.error("Blacklist Add Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An error occurred while blacklisting the user.")
            .setColor("Red"),
        ],
      });
    }
  },
};