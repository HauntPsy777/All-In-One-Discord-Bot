const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unhide',
    description: 'Unhide a channel and make it visible to non-administrative members.\nUsage: `unhide [#channel/channelID]`',
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

        // Get the target channel from mentions or ID
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        try {
            // Update channel permissions to unhide it
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: true // Allow the ViewChannel permission
            });

            // Send confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ ${channel} has been unhidden successfully.`);

            message.reply({ embeds: [embed] });

            // Log the channel unhiding in a specified log channel
            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Channel Unhidden')
                    .setDescription(`
**Unhidden By:** ${message.author} (${message.author.id})
**Channel:** ${channel.name} (${channel.id})
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error unhiding channel:', error);

            // Handle unexpected errors
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ An error occurred while trying to unhide the channel. Please try again later.');

            message.reply({ embeds: [errorEmbed] });
        }
    }
};