const { EmbedBuilder } = require("discord.js");
const antiLinkDB = require("../../db/linkDB");

module.exports = {
  name: "anti-link",
  description: "Enable or disable the anti-link feature.",
  usage: "`+anti-link <on|off>`",
  async execute(message, args) {
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

    // Validate the input
    const option = args[0]?.toLowerCase();
    if (!["on", "off"].includes(option)) {
      // Provide a guide for incorrect usage
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `❌ Invalid usage. Please use \`+anti-link on\` or \`+anti-link off\`.\n\n` +
              `**Example:** \`+anti-link on\` to enable the anti-link feature.\n` +
              `**Example:** \`+anti-link off\` to disable the anti-link feature.`
            )
            .setColor("Red"),
        ],
      });
    }

    const isEnabled = option === "on" ? 1 : 0;

    try {
      // Save settings to the database
      await antiLinkDB.saveSettings(message.guild.id, isEnabled);

      // Send success message
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ Anti-Link feature has been **${option.toUpperCase()}**.`
            )
            .setColor("Green"),
        ],
      });
    } catch (err) {
      console.error("Error updating anti-link settings:", err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An error occurred while updating the database.")
            .setColor("Red"),
        ],
      });
    }
  },
};