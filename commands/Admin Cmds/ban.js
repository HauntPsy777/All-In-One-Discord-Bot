const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a user by their ID with an optional reason.\nUsage: `!ban <userID> [reason]`',
    async execute(message, args) {
        // Check if the command executor has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Ban Members` permission to use this command.')
                ]
            });
        }

        // Check if the bot has the required permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ I need the `Ban Members` permission to perform this action.')
                ]
            });
        }

        // Validate user ID argument
        const userId = args[0];
        if (!userId || isNaN(userId)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please provide a valid user ID.\nUsage: `&ban <userID> [reason]`')
                ]
            });
        }

        // Extract reason if provided
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            // Check if the user is already banned
            const bans = await message.guild.bans.fetch();
            if (bans.has(userId)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`❌ <@${userId}> is already banned.`)
                    ]
                });
            }

            // Attempt to ban the user by their ID
            await message.guild.members.ban(userId, { reason });

            // Send a confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully banned <@${userId}>.\n**Reason:** ${reason}`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error banning user:', error);

            // Handle errors
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `❌ Failed to ban the user. This could be due to one of the following reasons:\n- The user is not in the server.\n- The ID is invalid.\n- The user has a higher role than the bot.`
                );

            return message.reply({ embeds: [errorEmbed] });
        }
    }
};