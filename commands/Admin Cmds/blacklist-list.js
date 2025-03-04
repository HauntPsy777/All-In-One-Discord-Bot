const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const BlacklistUserDB = require("../../db/blacklistuser");

module.exports = {
  name: "blacklist-list",
  description: "List all roles a user is blacklisted from.\nUsage: `&blacklist-list <UserId>`",
  async execute(message, args) {
    // Check if the command executor has the required permission
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
    if (args.length !== 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Usage: `&blacklist-list <UserId>`")
            .setColor("Red"),
        ],
      });
    }

    const userId = args[0];

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

      // Get blacklisted roles
      const blacklistedRoles = await BlacklistUserDB.getBlacklistedRoles(
        message.guild.id,
        userId
      );

      if (blacklistedRoles.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("✅ User is not blacklisted from any roles.")
              .setColor("Green"),
          ],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🚫 Blacklisted Roles for ${targetUser.user.username}`)
        .setColor("Red")
        .setDescription(
          blacklistedRoles
            .map((role) =>
              role.role_id === "all"
                ? "• **All Roles**"
                : `• <@&${role.role_id}> (Blacklisted at: <t:${Math.floor(
                    new Date(role.timestamp).getTime() / 1000
                  )}:F>)`
            )
            .join("\n")
        );

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Blacklist List Error:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An error occurred while listing blacklisted roles.")
            .setColor("Red"),
        ],
      });
    }
  },
};