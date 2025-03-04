const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a user by their ID.\nUsage: `unban <userID>`',
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
                        .setDescription('❌ Please provide a valid user ID to unban.')
                ]
            });
        }

        try {
            // Check if the user is banned
            const banInfo = await message.guild.bans.fetch(userId).catch(() => null);

            // Handle the case where the user is not banned
            if (!banInfo) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Yellow')
                            .setDescription(`❌ User with ID \`${userId}\` is not currently banned.`)
                    ]
                });
            }

            // Unban the user
            await message.guild.bans.remove(userId);

            // Send a confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully unbanned <@${userId}>.`)
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });

            message.reply({ embeds: [embed] });

            // Log the unban action in a specified log channel
            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('User Unbanned')
                    .setDescription(`
**Unbanned By:** ${message.author} (${message.author.id})
**User:** <@${userId}> (${userId})
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error unbanning user:', error);

            // Handle errors
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `❌ Failed to unban the user. This could be due to one of the following reasons:\n- The user ID is invalid.\n- The user is not banned.\n- An unexpected error occurred.`
                );

            message.reply({ embeds: [errorEmbed] });
        }
    }
};