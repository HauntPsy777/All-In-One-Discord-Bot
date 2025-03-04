const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const antiBotDB = require("../../db/botDB");
require("dotenv").config();
const developerIDs = process.env.DEVELOPER_IDS.split(",");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-bot")
    .setDescription("Enable or disable the anti-bot system and set up a log channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("state")
        .setDescription("Enable or disable the anti-bot system")
        .setRequired(true)
        .addChoices(
          { name: "On", value: "on" },
          { name: "Off", value: "off" }
        )
    )
    .addChannelOption(option =>
      option
        .setName("log_channel")
        .setDescription("Select the channel where logs will be sent")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if the user is either a bot developer or the server owner
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ **Only bot developers can use this command.**")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    const option = interaction.options.getString("state");
    const logChannel = interaction.options.getChannel("log_channel");

    // Validate the log channel
    if (logChannel.type !== 0) { // Ensure it's a text channel
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ **The log channel must be a text channel.**")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    const isEnabled = option === "on" ? 1 : 0;

    try {
      await antiBotDB.saveSettings(interaction.guild.id, isEnabled, logChannel.id);

      console.log(`✅ Anti-Bot for Guild ${interaction.guild.id} set to ${option.toUpperCase()}, Log Channel: ${logChannel.id}`);

      const setupEmbed = new EmbedBuilder()
        .setTitle("🔒 **Anti-Bot System Setup**")
        .setDescription(`Anti-bot protection has been **${option.toUpperCase()}**.`)
        .addFields(
          { name: "🔹 Status", value: `\`${option.toUpperCase()}\``, inline: true },
          { name: "📢 Log Channel", value: `<#${logChannel.id}>`, inline: true },
          { name: "👑 Setup By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📅 Setup Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor(option === "on" ? "Green" : "Red")
        .setTimestamp();

      await interaction.reply({ embeds: [setupEmbed], ephemeral: true });

      // Send the setup embed to the log channel
      await logChannel.send({ embeds: [setupEmbed] });

    } catch (err) {
      console.error("❌ Database Error:", err);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ An error occurred while updating the database.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }
  },
};