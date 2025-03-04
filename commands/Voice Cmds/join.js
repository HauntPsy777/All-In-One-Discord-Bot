const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// List of bot developers' Discord user IDs
const botDeveloperIDs = ['1218034475775299688', '1288459425979564032', '707239594239721494']; // Add more IDs as needed

module.exports = {
    name: 'join',
    description: 'Join the voice channel you are currently in or a specified voice channel.',
    usage: '<prefix>join [ChannelID or #Channel]',
    cooldown: 15,
    async execute(message, args) {
        // Debug: Check the user ID
        console.log('User ID:', message.author.id);

        // Check if the user is in the bot developer list
        if (!botDeveloperIDs.includes(message.author.id)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('- <a:Now:1335402123768238091> Only bot developers can use this command!');
            return message.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        let voiceChannel;

        // If no arguments are provided, use the user's current voice channel
        if (!args.length) {
            voiceChannel = message.member.voice.channel;
        } else {
            // Extract channel from mention or ID
            const channelArg = args[0];
            if (message.mentions.channels.size) {
                voiceChannel = message.mentions.channels.first(); // Get the mentioned channel
            } else if (channelArg) {
                voiceChannel = message.guild.channels.cache.get(channelArg); // Get the channel by ID
            }
        }

        // Handle invalid or missing voice channel
        if (!voiceChannel || voiceChannel.type !== 2) { // Ensure it's a voice channel
            const noChannelEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('- <:warning_26a0fe0f:1335402182177984654> Please specify a valid voice channel or join one! Example: `!join #Channel` or `!join 123456789012345678`.');
            return message.reply({ embeds: [noChannelEmbed], ephemeral: true });
        }

        // Check if the bot has permission to connect to the voice channel
        if (!voiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('- <:warning_26a0fe0f:1335402182177984654> I don\'t have permission to join that voice channel!');
            return message.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        try {
            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`- <a:Yes:1335402083591127053> Successfully joined <#${voiceChannel.id}>`);
            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error joining voice channel:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('- <:warning_26a0fe0f:1335402182177984654> An error occurred while trying to join the voice channel.');
            await message.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};