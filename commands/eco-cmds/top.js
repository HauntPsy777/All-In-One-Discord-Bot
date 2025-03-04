const db = require('../../db'); // Ensure correct path
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

// Cooldown map
const cooldowns = new Map();

module.exports = {
    name: 'top',
    description: 'Show the top 10 richest users in the bot as an image with profile pictures',
    aliases: ['leaderboard', 'lb'], // Aliases for the command
    cooldown: 10, // Cooldown in seconds
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 0) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `!top`\n\n**Description:** Displays the top 10 richest users in the bot as an image.');
            return message.reply({ embeds: [guideEmbed] });
        }

        // Cooldown check
        const now = Date.now();
        const cooldownAmount = this.cooldown * 1000; // Convert to milliseconds

        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                // React with an emoji and stop further execution
                return message.react('⏳'); // React with a clock emoji
            }
        }

        // Set cooldown
        cooldowns.set(message.author.id, now);
        setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

        try {
            // Fetch top 10 users from the database
            const rows = await new Promise((resolve, reject) => {
                db.all('SELECT userId, username, coins FROM users ORDER BY coins DESC LIMIT 10', [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            if (!rows.length) {
                return message.reply('No users found in the global leaderboard.');
            }

            // Image dimensions
            const width = 650;
            const rowHeight = 70;
            const height = 100 + rows.length * rowHeight; // Dynamic height based on rows
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Draw background
            ctx.fillStyle = '#141414';
            ctx.fillRect(0, 0, width, height);

            // Draw title
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Global Leaderboard', width / 2, 50);

            let yPosition = 100;

            // Draw each user row
            for (const [index, row] of rows.entries()) {
                const username = row.username || `User#${index + 1}`;
                const coins = row.coins || 0;

                // Fetch user avatar or use default
                let avatarURL;
                try {
                    const user = await message.client.users.fetch(row.userId);
                    avatarURL = user.displayAvatarURL({ extension: 'png', size: 64 });
                } catch (error) {
                    console.error('❌ Failed to fetch user avatar:', error.message);
                    avatarURL = 'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
                }

                // Draw row background
                ctx.fillStyle = index % 2 === 0 ? '#1e1e2e' : '#292b2f';
                ctx.fillRect(10, yPosition - 40, width - 20, rowHeight);

                // Draw profile picture (circular)
                const avatar = await loadImage(avatarURL);
                ctx.save();
                ctx.beginPath();
                ctx.arc(50, yPosition - 5, 25, 0, Math.PI * 2, true); // Centered circle
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 25, yPosition - 30, 50, 50); // Centered avatar
                ctx.restore();

                // Draw username
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 22px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(username, 90, yPosition);

                // Draw coin balance
                ctx.fillStyle = '#00ff00';
                ctx.font = 'bold 20px Arial';
                ctx.fillText(`Coins: ${coins}$`, 400, yPosition);

                // Draw rank with color
                const rankColor = getRankColor(index + 1);
                ctx.fillStyle = rankColor;
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`#${index + 1}`, width - 30, yPosition);

                yPosition += rowHeight;
            }

            // Save and send image
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'leaderboard.png' });
            await message.channel.send({ files: [attachment] });
        } catch (error) {
            console.error('❌ Error in leaderboard command:', error.message);
            message.reply('An error occurred while generating the leaderboard.');
        }
    },
};

// Helper function to determine rank color
function getRankColor(rank) {
    switch (rank) {
        case 1:
            return '#f1c40f'; // Gold
        case 2:
            return '#c0c0c0'; // Silver
        case 3:
            return '#cd7f32'; // Bronze
        default:
            return '#ffffff'; // White
    }
}