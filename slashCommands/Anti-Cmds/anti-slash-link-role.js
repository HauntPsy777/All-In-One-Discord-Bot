const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const antiLinkDB = require("../../db/linkDB");
require("dotenv").config();
const developerIDs = process.env.DEVELOPER_IDS.split(",");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antilink-role")
    .setDescription("Whitelist a role from the Anti-Link system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Select the role to whitelist from the Anti-Link system.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Check if the user is either a bot developer or the server owner
      if (!developerIDs.includes(interaction.user.id) && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ **Only bot developers or the server owner can use this command.**")
              .setColor("Red"),
          ],
          ephemeral: true,
        });
      }

      // Get the role from the interaction
      const role = interaction.options.getRole("role");
      if (!role) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("⚠️ **Role not found.** Please select a valid role.")
              .setColor("Yellow"),
          ],
          ephemeral: true,
        });
      }

      // Check if the role is already whitelisted
      const whitelistedRoles = await antiLinkDB.getWhitelistedRoles(interaction.guild.id);
      if (whitelistedRoles.includes(role.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`⚠️ **${role.name}** is already whitelisted from the Anti-Link system.`)
              .setColor("Yellow"),
          ],
          ephemeral: true,
        });
      }

      // Store the role in the database (whitelist role from Anti-Link)
      await antiLinkDB.addWhitelistedRole(interaction.guild.id, role.id);

      // Confirmation message (No logging)
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ **Anti-Link Role Whitelisted**")
        .setDescription(`The role **${role.name}** has been **whitelisted** from the Anti-Link feature.`)
        .addFields(
          { name: "📌 Role", value: `<@&${role.id}>`, inline: true },
          { name: "🔹 Role ID", value: `\`${role.id}\``, inline: true },
          { name: "👑 Whitelisted By", value: `<@${interaction.user.id}>`, inline: true }
        )
        .setColor("Green")
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

    } catch (error) {
      console.error("❌ Error executing /antilink-role command:", error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ An **error occurred** while executing the command.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }
  },
};