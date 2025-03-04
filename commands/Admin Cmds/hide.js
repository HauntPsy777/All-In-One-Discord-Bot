const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'hide',
    description: 'Hide a channel from non-administrative members.\nUsage: `hide [#channel]`',
    async execute(message, args) {
        // Check if the command executor has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Manage Channels` permission to use this command.')
                ]
            });
        }

        // Check if the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ I need the `Manage Channels` permission to perform this action.')
                ]
            });
        }

        const channel = message.mentions.channels.first() || message.channel;

        try {
            // Update channel permissions to hide it
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: false // Deny the ViewChannel permission
            });

            // Send confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`✅ ${channel} has been hidden successfully.`);

            message.reply({ embeds: [embed] });

            // Log the channel hiding in a specified log channel
            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Channel Hidden')
                    .setDescription(`
**Hidden By:** ${message.author} (${message.author.id})
**Channel:** ${channel.name} (${channel.id})
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error hiding channel:', error);

            // Handle unexpected errors
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ An error occurred while trying to hide the channel. Please try again later.');

            message.reply({ embeds: [errorEmbed] });
        }
    }
};