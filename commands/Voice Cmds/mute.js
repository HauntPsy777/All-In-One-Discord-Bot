const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mute a member in a voice channel.',
    usage: '<prefix>mute <@User or UserID>',
    async execute(message, args) {
        // Check if the user has permission to mute members
        if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('You do not have permission to mute members.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Handle incorrect usage (e.g., no user provided)
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('⚠️ Please mention a member or provide their ID. Example: `&mute @User` or `&mute 123456789012345678`.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Extract user from mention or ID
        let member;
        const userArg = args[0];

        if (message.mentions.members.size) {
            member = message.mentions.members.first(); // Get the mentioned member
        } else if (userArg) {
            member = await message.guild.members.fetch(userArg).catch(() => null); // Get the member by ID
        }

        // Handle invalid member
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('⚠️ The provided member is invalid. Please mention a valid member or provide their ID.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if the member is in a voice channel
        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('⚠️ The mentioned member is not in a voice channel.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if the bot has permission to mute members
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('⚠️ I do not have permission to mute members.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Mute the member
        try {
            await member.voice.setMute(true);
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription(`✅ Successfully muted ${member} in the voice channel.`);
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error muting member:', error);
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setDescription('⚠️ An error occurred while muting the member.');
            await message.reply({ embeds: [embed], ephemeral: true });
        }
    },
};