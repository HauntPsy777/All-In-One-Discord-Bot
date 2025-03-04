const { EmbedBuilder } = require("discord.js");
const antiLinkDB = require("../../db/linkDB");

module.exports = {
  name: "antilink-role",
  description: "Whitelist a role from the Anti-Link feature.",
  usage: "`+antilink-role <role>`",
  async execute(message, args) {
    try {
      // Allow only the server owner or a specific developer (by ID) to use the command
      const allowedUsers = [message.guild.ownerId, "1218034475775299688"]; // Add developer ID here
      if (!allowedUsers.includes(message.author.id)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Only the server owner or developer can use this command.")
              .setColor("Red"),
          ],
        });
      }

      // Check if a role was provided
      if (!args[0]) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `❌ Invalid usage. Please provide a role mention or ID.\n\n` +
                `**Example:** \`+antilink-role @Role\` or \`+antilink-role 123456789012345678\`\n` +
                `**Note:** This command whitelists the role from the Anti-Link feature.`
              )
              .setColor("Red"),
          ],
        });
      }

      // Extract role ID from mention or use the provided ID
      const roleId = args[0].replace(/[<@&>]/g, ""); // Remove mention characters
      const role = message.guild.roles.cache.get(roleId);

      // Check if the role exists
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Role not found. Please provide a valid role mention or ID.")
              .setColor("Red"),
          ],
        });
      }

      // Store the role in the database (e.g., adding to Anti-Link settings)
      await antiLinkDB.addWhitelistedRole(message.guild.id, roleId);

      // Confirmation message
      const successEmbed = new EmbedBuilder()
        .setDescription(
          `✅ The role **${role.name}** has been whitelisted from the Anti-Link feature.`
        )
        .setColor("Green");

      message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error executing antilink-role command:", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An error occurred while executing the command.")
            .setColor("Red"),
        ],
      });
    }
  },
};