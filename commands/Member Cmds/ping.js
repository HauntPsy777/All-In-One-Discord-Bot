const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: 'Checks the bot\'s ping, API latency, and uptime.',
    async execute(message) {
        // Get bot's latency and API latency
        const botPing = Date.now() - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);

        // Calculate the bot's uptime
        const uptime = process.uptime(); // Get uptime in seconds
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        // Format uptime string
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Create an embed to display the results
        const embed = new EmbedBuilder()
            .setColor('Green')
            .addFields(
                { name: 'Bot Latency', value: `\`\`\`yaml\n${botPing}ms\`\`\``, inline: true },
                { name: 'Uptime', value: `\`\`\`yaml\n${uptimeString}\`\`\``, inline: true },
                { name: 'Developers', value: `\`\`\`yaml\n Celestial 🌙\`\`\``, inline: true }
            )
        
        // Send the embed message
        await message.reply({ embeds: [embed] });
    },
};
