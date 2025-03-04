const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "verify-panel",
  description: "Send a verification panel with buttons for verify-boy and verify-girl.",
  async execute(message) {
    // Check if the user has permission to send the panel
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Create the embed for the panel
    const panelEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("Verification Panel")
      .setDescription("Click the button below to verify yourself as **Male** or **Female**.");

    // Create buttons for verify-boy and verify-girl
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("vb")
        .setLabel("Verify as Male")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("vg")
        .setLabel("Verify as Female")
        .setStyle(ButtonStyle.Success)
    );

    // Send the embed with buttons
    await message.channel.send({ embeds: [panelEmbed], components: [row] });
  },
};