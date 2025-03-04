const db = require('../../db'); // Adjust the path
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Check your balance or another user\'s balance',
    aliases: ['bal'], // Aliases for the command
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 1) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&balance [@user|userID]`\n\n**Examples:**\n`&balance` - Check your own balance\n`&balance @User` - Check another user\'s balance\n`&balance 123456789012345678` - Check balance by user ID');
            return message.reply({ embeds: [guideEmbed] });
        }

        let targetUser;
        // Check if the user provided a mention or ID
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        } else if (args[0]) {
            // Validate if the argument is a valid user ID
            if (!/^\d+$/.test(args[0])) {
                return message.reply('❌ Please provide a valid user ID or mention.');
            }
            try {
                targetUser = await message.client.users.fetch(args[0]);
            } catch (error) {
                return message.reply('❌ Could not find the user. Please check the user ID or mention.');
            }
        } else {
            // Default to the message author if no user is specified
            targetUser = message.author;
        }

        // Retrieve the user's balance from the database
        db.get('SELECT username, coins FROM users WHERE userId = ?', [targetUser.id], (err, row) => {
            if (err) {
                console.error('❌ SQLite Error:', err.message);
                return message.reply('❌ An error occurred while retrieving the balance.');
            }

            const balance = row ? row.coins : 0;
            const storedUsername = row ? row.username : targetUser.username;

            // Create an embed to display the balance
            const embed = new EmbedBuilder()
                .setColor('#6200a1')
                .setTitle('Balance')
                .setDescription(`🏦 **${storedUsername}**, your balance is **${balance}$**. <:alchemist:1341777426233036848>`);

            message.channel.send({ embeds: [embed] });
        });
    },
};