const db = require('../../db'); // Adjust the path as needed
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'addmoney',
    description: 'Add money to a user\'s balance',
    async execute(message, args) {
        const ownerId = '1218034475775299688'; // Bot owner's ID

        // Check if the command is used by the bot owner
        if (message.author.id !== ownerId) {
            return message.reply('❌ Only the bot owner can use this command.');
        }

        // Guide for correct usage
        if (args.length < 2) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&addmoney <@user|userID> <amount>`\n\n**Example:**\n`&addmoney @User 100`\n`&addmoney 123456789012345678 200`');
            return message.reply({ embeds: [guideEmbed] });
        }

        // Extract user and amount from arguments
        const userInput = args[0];
        const amount = parseInt(args[1]);

        // Validate the amount
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ Please provide a valid amount greater than 0.');
        }

        let user;
        // Check if the input is a mention or a user ID
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            // Fetch user by ID
            try {
                user = await message.client.users.fetch(userInput);
            } catch (error) {
                return message.reply('❌ Invalid user ID or user not found.');
            }
        } else {
            return message.reply('❌ Please mention a user or provide a valid user ID.');
        }

        // Update the database
        db.get('SELECT coins FROM users WHERE userId = ?', [user.id], (err, row) => {
            if (err) {
                console.error('❌ SQLite Error:', err.message);
                return message.reply('❌ An error occurred while accessing the database.');
            }

            let newBalance;
            if (!row) {
                // Insert new user with username
                newBalance = amount;
                db.run('INSERT INTO users (userId, username, coins) VALUES (?, ?, ?)', [user.id, user.username, newBalance], (err) => {
                    if (err) {
                        console.error('❌ SQLite Error:', err.message);
                        return message.reply('❌ An error occurred while adding the user to the database.');
                    }
                });
            } else {
                // Update existing user's balance AND username
                newBalance = row.coins + amount;
                db.run('UPDATE users SET coins = ?, username = ? WHERE userId = ?', [newBalance, user.username, user.id], (err) => {
                    if (err) {
                        console.error('❌ SQLite Error:', err.message);
                        return message.reply('❌ An error occurred while updating the user\'s balance.');
                    }
                });
            }

            // Success message
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`✅ Successfully added ${amount}$ to ${user.username}'s balance.`);

            message.channel.send({ embeds: [embed] });
        });
    },
};