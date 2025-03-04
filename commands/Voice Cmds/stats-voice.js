const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'statsvoice',
    description: 'Displays the server status, including voice channel statistics.',
    aliases: ['vc'],
    usage: '<prefix>statsvoice [ChannelID or #Channel]',
    async execute(message, args) {
        // Check for permission
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('You do not have permission to use this command.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        const guild = message.guild;
        const members = guild.members.cache;
        const membersInVoice = members.filter(member => member.voice.channelId).size;
        const boostCount = guild.premiumSubscriptionCount || 0;
        const boostLevel = guild.premiumTier || 'None'; // Fetch boost level
        const guildIconURL = guild.iconURL();

        // Handle incorrect usage (e.g., no channel provided)
        if (args.length > 0) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ This command does not require additional arguments. Use `!statsvoice` to display server stats.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Create the embed
        const embedMessage = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Stats!`, iconURL: guildIconURL })
            .setColor('Random')
            .setThumbnail(guildIconURL || null)
            .addFields(
                { name: '<:members:1335402344665579660>  Members:', value: `<:emoji_53:1335402316769267805>\`${members.size}\``, inline: true },
                { name: '<:fum:1335402284682711102>  In Voice:', value: `<:emoji_53:1335402316769267805>\`${membersInVoice}\``, inline: true },
                { name: '<a:red_vamp_boost:1335402435044311131>  Boosts:', value: `<:emoji_53:1335402316769267805>\`${boostCount}\``, inline: true },
            )
            .setFooter({ text: `${guild.name} Live Stats`, iconURL: guild.iconURL() })
            .setTimestamp();

        // Create the button
        const statsButton = new ButtonBuilder()
            .setCustomId('stats')
            .setLabel(`Voice: ${membersInVoice}`)
            .setEmoji('<a:discord:1335412080567910420>')
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(statsButton);

        // Delete the command message and send the embed
        try {
            await message.delete();
            await message.channel.send({ embeds: [embedMessage], components: [row] });
        } catch (error) {
            console.error('Error sending statsvoice embed:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('⚠️ An error occurred while sending the server stats.');
            await message.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};