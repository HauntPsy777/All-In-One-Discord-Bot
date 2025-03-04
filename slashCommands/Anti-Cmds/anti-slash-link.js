const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const antiLinkDB = require("../../db/linkDB");
require("dotenv").config();
const developerIDs = process.env.DEVELOPER_IDS.split(",");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-link")
    .setDescription("Enable or disable the anti-link feature and set a log channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("state")
        .setDescription("Enable or disable the anti-link feature")
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
    try {
      // Restrict command to bot developers only
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

      // Ensure the selected channel is a valid text channel
      if (!logChannel || logChannel.type !== ChannelType.GuildText) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("⚠️ **Please select a valid text channel for logging.**")
              .setColor("Yellow"),
          ],
          ephemeral: true,
        });
      }

      // Ensure bot has permission to send messages in the log channel
      if (!logChannel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`⚠️ **I don't have permission to send messages in ${logChannel}. Please fix this before enabling Anti-Link.**`)
              .setColor("Yellow"),
          ],
          ephemeral: true,
        });
      }

      const isEnabled = option === "on" ? 1 : 0;

      await antiLinkDB.saveSettings(interaction.guild.id, isEnabled, logChannel.id);

      console.log(`✅ Anti-Link for Guild ${interaction.guild.id} set to ${option.toUpperCase()}, Log Channel: ${logChannel.id}`);

      const setupEmbed = new EmbedBuilder()
        .setTitle("🔒 **Anti-Link System Setup**")
        .setDescription(`Anti-link protection has been **${option.toUpperCase()}**.`)
        .addFields(
          { name: "🔹 Status", value: `\`${option.toUpperCase()}\``, inline: true },
          { name: "📢 Log Channel", value: `<#${logChannel.id}>`, inline: true },
          { name: "👑 Setup By", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📅 Setup Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor(option === "on" ? "Green" : "Red")
        .setTimestamp();

      await interaction.reply({ embeds: [setupEmbed], ephemeral: false });

      // Send log to the log channel if enabled
      if (isEnabled) {
        await logChannel.send({ embeds: [setupEmbed] });
      }

    } catch (err) {
      console.error("❌ Database Error:", err);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ **An error occurred while updating the database.**")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }
  },
};