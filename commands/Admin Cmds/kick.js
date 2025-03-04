const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a member from the server.\nUsage: `kick <@user/userID> [reason]`',
    async execute(message, args) {
        // Check if the command executor has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Kick Members` permission to use this command.')
                ]
            });
        }

        // Check if the bot has the required permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ I need the `Kick Members` permission to perform this action.')
                ]
            });
        }

        // Validate user argument
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please mention a user to kick or provide their user ID.')
                ]
            });
        }

        // Check if the user is the same as the bot or higher
        if (user.id === message.author.id) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You cannot kick yourself.')
                ]
            });
        }

        if (user.id === message.guild.ownerId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You cannot kick the server owner.')
                ]
            });
        }

        if (user.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You cannot kick a member with the same or higher role.')
                ]
            });
        }

        // Optionally, get a reason for the kick
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            // Kick the user
            await user.kick(reason);

            // Send a confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully kicked ${user.user.tag}.`);

            message.reply({ embeds: [embed] });

            // Log the kick action in a specified log channel
            const logChannel = message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('User Kicked')
                    .setDescription(`
**Kicked By:** ${message.author} (${message.author.id})
**User:** ${user.user.tag} (${user.id})
**Reason:** ${reason}
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error kicking user:', error);

            // Send an error message if something goes wrong
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ There was an error trying to kick the user. Please check my permissions and try again.');

            message.reply({ embeds: [errorEmbed] });
        }
    },
};