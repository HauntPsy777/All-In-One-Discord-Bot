const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Make the bot repeat what you say.\nUsage: `&say <message>`',
    async execute(message, args) {
        // Check if the user provided a message
        if (!args.length) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please provide a message for me to repeat.')
                ]
            }).then(msg => setTimeout(() => msg.delete(), 5000)); // Auto-delete reply after 5 sec
        }

        // Check if the user has the required permissions (optional)
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Manage Messages` permission to use this command.')
                ]
            }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Join the arguments into a single string
        const text = args.join(' ');

        // Delete the user's command message
        await message.delete().catch(console.error);

        // Send the message
        message.channel.send(text);
    }
};