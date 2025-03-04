const db = require('../../db'); // Ensure correct path
const { EmbedBuilder } = require('discord.js');

const DAILY_REWARD = 500; // Amount of coins given daily
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

module.exports = {
    name: 'daily',
	aliases: ['d'],
    description: 'Claim your daily reward',
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 0) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `!daily`\n\n**Description:** Claim your daily reward of **500$** every 24 hours.');
            return message.reply({ embeds: [guideEmbed] });
        }

        const userId = message.author.id;
        const username = message.author.username;
        const currentTime = Date.now();

        db.get('SELECT coins, lastDaily FROM users WHERE userId = ?', [userId], (err, row) => {
            if (err) {
                console.error('❌ SQLite Error:', err.message);
                return message.reply('❌ An error occurred while accessing the database.');
            }

            // If user is not in the database, insert them
            if (!row) {
                db.run('INSERT INTO users (userId, username, coins, lastDaily) VALUES (?, ?, ?, ?)', 
                    [userId, username, DAILY_REWARD, currentTime], (err) => {
                        if (err) {
                            console.error('❌ SQLite Error:', err.message);
                            return message.reply('❌ An error occurred while adding you to the database.');
                        }

                        const embed = new EmbedBuilder()
                            .setColor('#f1c40f')
                            .setDescription(`🎉 ${message.author}, you have received **${DAILY_REWARD}$** as your daily reward!`);

                        return message.channel.send({ embeds: [embed] });
                    });
                return;
            }

            const lastClaim = row.lastDaily || 0;
            const timeSinceLastClaim = currentTime - lastClaim;

            // Check if the user is on cooldown
            if (timeSinceLastClaim < COOLDOWN) {
                const remainingTime = COOLDOWN - timeSinceLastClaim;
                const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`⏳ ${message.author}: Your next gift is available **in ${hours}h ${minutes}m**. Please wait ⏰`);

                return message.channel.send({ embeds: [embed] });
            }

            // Update user coins and last daily claim time
            const newBalance = row.coins + DAILY_REWARD;
            db.run('UPDATE users SET coins = ?, lastDaily = ?, username = ? WHERE userId = ?', 
                [newBalance, currentTime, username, userId], (err) => {
                    if (err) {
                        console.error('❌ SQLite Error:', err.message);
                        return message.reply('❌ An error occurred while updating your balance.');
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#f1c40f')
                        .setDescription(`🎉 ${message.author}, you have received **${DAILY_REWARD}$** as your daily reward!`);

                    message.channel.send({ embeds: [embed] });
                });
        });
    },
};