const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clear a specified number of messages from the channel.\nUsage: `clear <amount>`',
    async execute(message, args) {
        // Check if the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Manage Messages` permission to use this command.')
                ]
            }).then(msg => setTimeout(() => msg.delete(), 5000)); // Auto-delete reply after 5 sec
        }

        // Validate the amount of messages to delete
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please provide a valid number of messages to delete (greater than 0).')
                ]
            }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        try {
            let remaining = amount;
            let totalDeleted = 0;

            while (remaining > 0) {
                const limit = Math.min(remaining, 100); // Delete up to 100 messages at a time
                const messages = await message.channel.messages.fetch({ limit });
                const messagesToDelete = messages.filter(msg => msg.createdTimestamp > Date.now() - 14 * 24 * 60 * 60 * 1000);

                if (messagesToDelete.size === 0) {
                    break; // No more messages to delete
                }

                await message.channel.bulkDelete(messagesToDelete, true);
                totalDeleted += messagesToDelete.size;
                remaining -= messagesToDelete.size;

                // Wait a bit to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (totalDeleted === 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('❌ No messages were found to delete that are less than 14 days old.')
                    ]
                }).then(msg => setTimeout(() => msg.delete(), 5000));
            }

            // Send a confirmation message
            const confirmationEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ \`${totalDeleted}\` messages have been successfully deleted.`);

            message.channel.send({ embeds: [confirmationEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000));

            // Log the deletion in a specified log channel
            const logChannel = message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Messages Cleared')
                    .setDescription(`
**Cleared By:** ${message.author} (${message.author.id})
**Channel:** ${message.channel.name} (${message.channel.id})
**Number of Messages:** ${totalDeleted}
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error clearing messages:', error);

            // Send an error message
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ An error occurred while trying to clear messages. Please try again later.');

            message.reply({ embeds: [errorEmbed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }
    }
};