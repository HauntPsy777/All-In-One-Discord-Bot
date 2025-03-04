const db = require('../../db'); // Ensure correct path
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'transfer',
    description: 'Transfer Master Coins to another user',
    aliases: ['trans', 'tr'], // Aliases for the command
    usage: '&transfer [@user|userID] [amount]',
    async execute(message, args) {
        // Guide for correct usage
        if (args.length < 2) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&transfer [@user|userID] [amount]`\n\n**Examples:**\n`&transfer @User 100` - Transfer 100 coins to a mentioned user\n`&transfer 123456789012345678 200` - Transfer 200 coins to a user by ID');
            return message.reply({ embeds: [guideEmbed] });
        }

        const sender = message.author;
        const amount = parseInt(args[1]);

        // Validate amount
        if (isNaN(amount)) {
            return message.reply('❌ Please provide a valid number for the amount.');
        }
        if (amount <= 0) {
            return message.reply('❌ The transfer amount must be greater than 0.');
        }

        // Fetch receiver (mention or ID)
        let receiver;
        if (message.mentions.users.size > 0) {
            receiver = message.mentions.users.first();
        } else if (/^\d+$/.test(args[0])) {
            // Fetch user by ID
            try {
                receiver = await message.client.users.fetch(args[0]);
            } catch (error) {
                return message.reply('❌ Invalid user ID or user not found.');
            }
        } else {
            return message.reply('❌ Please mention a user or provide a valid user ID.');
        }

        // Validate receiver
        if (receiver.id === sender.id) {
            return message.reply('❌ You cannot transfer coins to yourself.');
        }

        // Fetch sender and receiver balances
        db.get('SELECT coins FROM users WHERE userId = ?', [sender.id], (err, senderRow) => {
            if (err) {
                console.error('❌ SQLite Error:', err.message);
                return message.reply('❌ An error occurred while accessing the database.');
            }

            if (!senderRow || senderRow.coins < amount) {
                return message.reply('❌ You do not have enough coins to transfer.');
            }

            db.get('SELECT coins FROM users WHERE userId = ?', [receiver.id], (err, receiverRow) => {
                if (err) {
                    console.error('❌ SQLite Error:', err.message);
                    return message.reply('❌ An error occurred while accessing the database.');
                }

                // Update balances
                const senderNewBalance = senderRow.coins - amount;
                const receiverNewBalance = (receiverRow ? receiverRow.coins : 0) + amount;

                db.run('UPDATE users SET coins = ?, username = ? WHERE userId = ?', 
                    [senderNewBalance, sender.username, sender.id], (err) => {
                        if (err) {
                            console.error('❌ SQLite Error:', err.message);
                            return message.reply('❌ An error occurred while updating your balance.');
                        }
                    });

                db.run('INSERT INTO users (userId, username, coins) VALUES (?, ?, ?) ON CONFLICT(userId) DO UPDATE SET coins = ?, username = ?', 
                    [receiver.id, receiver.username, receiverNewBalance, receiverNewBalance, receiver.username], (err) => {
                        if (err) {
                            console.error('❌ SQLite Error:', err.message);
                            return message.reply('❌ An error occurred while updating the receiver\'s balance.');
                        }
                    });

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Transfer Successful')
                    .setDescription(`💰 **${sender.username}** sent **${amount}$** to **${receiver.username}**!`)
                    .setFooter({ text: 'Master Coins Economy System' });

                message.channel.send({ embeds: [embed] });
            });
        });
    },
};