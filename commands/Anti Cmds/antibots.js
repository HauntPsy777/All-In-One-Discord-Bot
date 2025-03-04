const { EmbedBuilder } = require("discord.js");
const antiBotDB = require("../../db/botDB");

module.exports = {
  name: "anti-bot",
  aliases: ["antibots"],
  description:
    "Enable or disable the anti-bot feature.\nUsage: `+anti-bot <on/off>`",
  async execute(message, args) {
    try {
      // Check if the user is the server owner or the developer
      const allowedUsers = [message.guild.ownerId, "1218034475775299688"]; // Server owner and developer IDs
      if (!allowedUsers.includes(message.author.id)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "❌ Only the server owner or the developer can use this command."
              )
              .setColor("Red"),
          ],
        });
      }

      // If no arguments are provided, show the command usage guide
      if (!args[0]) {
        const usageEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setDescription(
            `**How to use the command:**\n\`+anti-bot <on/off>\`\n**Examples:**\n\`+anti-bot on\` - Enables the anti-bot feature.\n\`+anti-bot off\` - Disables the anti-bot feature.`
          );

        return message.reply({ embeds: [usageEmbed] });
      }

      // Validate arguments
      const option = args[0]?.toLowerCase();
      if (!["on", "off"].includes(option)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "❌ Invalid option. Please use `on` or `off`.\n\n**Usage:**\n`+anti-bot <on/off>`\n**Examples:**\n`+anti-bot on` - Enables the anti-bot feature.\n`+anti-bot off` - Disables the anti-bot feature."
              )
              .setColor("Red"),
          ],
        });
      }

      // Convert the option to a boolean (1 for enabled, 0 for disabled)
      const isEnabled = option === "on" ? 1 : 0;

      // Save settings to the database
      await antiBotDB.saveSettings(message.guild.id, isEnabled);

      console.log(
        `Anti-Bot feature for Guild ID ${
          message.guild.id
        } has been set to ${option.toUpperCase()}`
      );

      // Send success message
      const successEmbed = new EmbedBuilder()
        .setDescription(
          `✅ Anti-Bot feature has been **${option.toUpperCase()}**.`
        )
        .setColor("Green");

      await message.reply({ embeds: [successEmbed] });

      // Log the action in a specified log channel (if applicable)
      const logChannel = message.guild.channels.cache.find(
        (ch) => ch.name === "mod-logs"
      );
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle("Anti-Bot Feature Updated")
          .setDescription(
            `**Action:** Anti-Bot feature has been **${option.toUpperCase()}**\n**Updated By:** ${message.author} (${message.author.id})`
          )
          .setColor(0x2b2d31)
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (err) {
      console.error("Database Error:", err);

      // Handle errors
      const errorEmbed = new EmbedBuilder()
        .setDescription("❌ An error occurred while updating the database.")
        .setColor("Red");

      await message.reply({ embeds: [errorEmbed] });
    }
  },
};