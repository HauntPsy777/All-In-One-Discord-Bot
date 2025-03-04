const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vclist',
  aliases: ['vL'],
  description: 'Shows a list of users currently in your voice channel or a specified voice channel.',
  usage: '<prefix>vclist [ChannelID or #Channel]',
  async execute(message, args) {
    // Handle incorrect usage (e.g., no channel provided)
    if (args.length > 0) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('⚠️ This command does not require additional arguments. Use `&vclist` to list users in your current voice channel.');
      return message.reply({ embeds: [embed], ephemeral: true });
    }

    // Ensure the user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('- <a:now:1334568425623912508> You must be in a voice channel to use this command.');
      return message.reply({ embeds: [embed], ephemeral: true });
    }

    // Get the list of users in the voice channel
    const members = voiceChannel.members;
    const memberMentions = members.map(member => `<@${member.user.id}>`).join('\n');

    // If no members are found
    if (!memberMentions) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('- <a:now:1334568425623912508> No other members are currently in this voice channel.');
      return message.reply({ embeds: [embed], ephemeral: true });
    }

    // Create and send the embed showing the users
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setAuthor({ name: 'Users in Voice Channel', iconURL: message.guild.iconURL() })
      .setDescription(`- **Current Members in ${voiceChannel.name}:**\n${memberMentions}`)
      .setThumbnail(message.guild.iconURL())  // Set server logo as the thumbnail
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};