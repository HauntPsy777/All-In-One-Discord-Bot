const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'find',
    description: 'Finds a user in a voice channel and displays relevant information.',
    usage: '<prefix>find <@User or UserID>',
    async execute(message, args) {
        let user;

        // Handle incorrect usage (e.g., no user provided)
        if (!args.length && !message.mentions.users.size) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ Please provide a user mention or ID. Example: `&find @User` or `&find 123456789012345678`.');
            return message.reply({ embeds: [embed] });
        }

        // Extract user from mention or ID
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first(); // Get the mentioned user
        } else if (args.length > 0) {
            user = await message.client.users.fetch(args[0]).catch(() => null); // Get the user by ID
        } else {
            user = message.author; // Default to the command user
        }

        // Handle invalid user
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('⚠️ The provided user is invalid. Please mention a user or provide a valid user ID.');
            return message.reply({ embeds: [embed] });
        }

        // Check if the user is trying to find themselves
        if (user.id === message.author.id) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription("⚠️ You can't find yourself!");
            return message.reply({ embeds: [embed] });
        }

        // Fetch the member from the guild
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('⚠️ The user is not in this server.');
            return message.reply({ embeds: [embed] });
        }

        // Create the embed
        const embed = new EmbedBuilder().setColor('Random');

        // Check if the user is in a voice channel
        if (member.voice.channel) {
            const voiceChannel = member.voice.channel;

            // Get additional voice channel information
            const membersInChannel = voiceChannel.members.map(member => member.user.tag).join('\n') || 'No members';
            const channelType = voiceChannel.type === 2 ? 'Voice Channel' : 'Stage Channel';

            embed
                .setAuthor({ 
                    name: `Voice Find: ${voiceChannel.name}`, 
                    iconURL: message.guild.iconURL(), 
                    url: "https://discord.gg/D32kergpFw" 
                })
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 64 }))
                .addFields(
                    { name: '🔍 **Voice Channel:**', value: `<#${voiceChannel.id}>`, inline: true },
                    { name: '📝 **Channel Name:**', value: `${voiceChannel.name}`, inline: true },
                    { name: '🎤 **Channel Type:**', value: `${channelType}`, inline: true },
                    { name: '👥 **Members in Channel:**', value: `${membersInChannel}`, inline: false }
                )
                .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true, size: 32 }) })
                .setTimestamp();
        } else {
            embed
                .setDescription(`⚠️ ${user.tag} is not connected to any voice channel.`)
                .setColor('Random');
        }

        // Send the embed
        await message.reply({ embeds: [embed] });
    },
};