const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const BlacklistUserDB = require("../../db/blacklistuser");

module.exports = {
  name: "blacklist-remove",
  description: "Remove a role blacklist from a user.\nUsage: `+blacklist-remove <UserId> [RoleId]`",
  async execute(message, args) {
    // Check if user is an administrator
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
    if (args.length < 1 || args.length > 2) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Usage: `+blacklist-remove <UserId> [RoleId]`")
            .setColor("Red"),
        ],
      });
    }

    const userId = args[0];
    const roleId = args[1] || null;

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

      // If role is specified, validate it
      if (roleId) {
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
      }

      // Check if the user is blacklisted
      const blacklistedRoles = await BlacklistUserDB.getBlacklistedRoles(
        message.guild.id,
        userId
      );

      if (blacklistedRoles.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ User is not blacklisted from any roles.")
              .setColor("Red"),
          ],
        });
      }

      // Check if the user is blacklisted for the specified role
      if (roleId && !blacklistedRoles.some((role) => role.role_id === roleId)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`❌ User is not blacklisted for role <@&${roleId}>.`)
              .setColor("Red"),
          ],
        });
      }

      // Remove from blacklist
      await BlacklistUserDB.removeBlacklistRole(
        message.guild.id,
        userId,
        roleId || "all"
      );

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ User ${targetUser.user.username} removed from blacklist ${
                roleId ? `for role <@&${roleId}>` : "from all roles"
              }.`
            )
            .setColor("Green"),
        ],
      });
    } catch (error) {
      console.error("Blacklist Remove Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An error occurred while removing user from blacklist.")
            .setColor("Red"),
        ],
      });
    }
  },
};