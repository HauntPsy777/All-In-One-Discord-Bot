const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'checkvoice',
    description: 'Check if a user is in a voice channel across all guilds',
    async execute(message, args, client) {
        const userId = args[0];
        if (!userId) {
            return message.reply('Please provide a user ID. Usage: `&checkvoice <userID>`');
        }

        let results = [];
        let totalUsers = 0;

        for (const guild of client.guilds.cache.values()) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member && member.voice.channel) {
                const channel = member.voice.channel;
                totalUsers += channel.members.size;
                results.push({
                    guildName: guild.name,
                    memberCount: guild.memberCount,
                    channelName: channel.name,
                    userCount: channel.members.size,
                    usersInChannel: channel.members.map(m => 
                        `**${m.user.tag}** ${m.voice.mute ? "🔇" : "🎤"} ${m.voice.deaf ? "🔕" : "🎧"}`
                    ).join("\n")
                });
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎙️ Voice Channel Check')
            .setColor('#0099ff')  // Adjust color to match your example
            .setFooter({ text: 'Bot by Celestials | ' + new Date().toLocaleTimeString() });

        if (results.length > 0) {
            embed.setDescription(`User <@${userId}> is in the following voice channels:`);

            results.forEach((result) => {
                embed.addFields(
                    { name: 'Server:', value: `**${result.guildName}**`, inline: true },
                    { name: 'Server Member Count:', value: `**${result.memberCount}**`, inline: true },
                    { name: 'Voice Channel Name:', value: `**${result.channelName}**`, inline: true },
                    { name: 'Users in Channel:', value: `**${result.userCount}**`, inline: true },
                    { name: 'Users in Voice Channel:', value: result.usersInChannel, inline: false }
                );
            });
        } else {
            embed.setDescription(`User <@${userId}> is **not** in any voice channels.`);
        }

        // Buttons Row
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('user_info')
                    .setLabel('User Info')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('server_info')
                    .setLabel('Server Info')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('join_vc')
                    .setLabel('Join Voice Channel')
                    .setStyle(ButtonStyle.Success)
            );

        // Send the embed with buttons
        message.reply({ embeds: [embed], components: [buttons] });
    },
};
