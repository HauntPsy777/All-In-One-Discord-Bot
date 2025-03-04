const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const tokenLogDB = require("../../db/tokenLogDB");

module.exports = {
  name: "setup-tokens-logs",
  aliases: ['settokens'],
  description: "Set up a logging channel for token detection actions.",
  usage: "<prefix>setup-tokens-logs <#Channel or ChannelID>",
  async execute(message, args) {
    // Check if the user has Administrator permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("You need **Administrator** permissions to use this command!");
      return message.reply({ embeds: [embed] });
    }

    // Handle incorrect usage (e.g., no channel provided)
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ Please provide a channel mention or ID. Example: `&setup-tokens-logs #logs` or `&setup-tokens-logs 123456789012345678`.");
      return message.reply({ embeds: [embed] });
    }

    // Extract channel from mention or ID
    let channel;
    const channelArg = args[0];

    if (message.mentions.channels.size) {
      channel = message.mentions.channels.first(); // Get the mentioned channel
    } else if (channelArg) {
      channel = message.guild.channels.cache.get(channelArg); // Get the channel by ID
    }

    // Handle invalid channel
    if (!channel || channel.type !== 0) { // Ensure it's a text channel
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ The provided channel is invalid. Please mention a text channel or provide a valid channel ID.");
      return message.reply({ embeds: [embed] });
    }

    // Check if the bot has permission to send messages in the channel
    if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ I do not have permission to send messages in that channel. Please ensure I have the **Send Messages** permission.");
      return message.reply({ embeds: [embed] });
    }

    // Confirmation prompt
    const confirmationEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`Are you sure you want to set ${channel} as the token detection log channel? React with ✅ to confirm or ❌ to cancel.`);

    const confirmationMessage = await message.reply({ embeds: [confirmationEmbed] });
    await confirmationMessage.react('✅'); // Confirm reaction
    await confirmationMessage.react('❌'); // Cancel reaction

    // Wait for the user's reaction
    const filter = (reaction, user) => {
      return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    try {
      const collected = await confirmationMessage.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] });
      const reaction = collected.first();

      // Handle confirmation or cancellation
      if (reaction.emoji.name === '✅') {
        await tokenLogDB.saveLogChannel(message.guild.id, channel.id); // Update the log channel in the database
        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`<a:yes:1323943621233348679> Token detection logs will now be sent to ${channel}.`);
        await message.reply({ embeds: [successEmbed] });
      } else {
        const cancelEmbed = new EmbedBuilder()
          .setColor("Red")
          .setDescription("<a:now:1334568425623912508> Token log setup cancelled.");
        await message.reply({ embeds: [cancelEmbed] });
      }
    } catch (error) {
      // Handle timeout or errors
      const timeoutEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ Token log setup timed out. Please try again.");
      await message.reply({ embeds: [timeoutEmbed] });
    }
  },
};