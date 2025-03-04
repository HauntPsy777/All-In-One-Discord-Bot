const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    aliases: ['u'],
    description: 'Get detailed information about a user.',
    cooldown: 10,
    userPerms: [], // Add any required user permissions here
    botPerms: [], // Add any required bot permissions here
    async execute(message, args, client) {
        let user;
        if (message.mentions.users.size) {
            user = message.mentions.users.first();
        } else if (args.length) {
            user = await client.users.fetch(args[0]).catch(() => null);
        } else {
            user = message.author;
        }

        if (!user) {
            return message.channel.send('User not found.');
        }

        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            return message.channel.send('This user is not in the server.');
        }

        const joinedAt = member.joinedAt;
        const timeJoined = `<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`;
        const createdAt = user.createdAt;
        const timeCreated = `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`;
        const highestRole = member.roles.highest;
        const highestRoleName = highestRole ? highestRole.toString() : 'No Role';
        const bannerURL = user.bannerURL({ size: 2048, format: 'png' }) || 'No Banner';
        const nickname = member.nickname || `\`No Nickname\``;

        // Get all roles
        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id) // Exclude @everyone
            .map(role => role.toString())
            .join(', ');

        const rolesDisplay = roles.length > 0 ? roles : 'No Roles';

        const userInfoEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `${user.username}'s Information`,
                iconURL: user.displayAvatarURL({ dynamic: true, size: 512 }),
            })
            .setColor('Random')
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setImage(bannerURL !== 'No Banner' ? bannerURL : null)
            .setDescription(` 🔍 User information for \`${user.username}\``)
            .addFields(
                { name: '❗・Info General', value: `**Username**: ${user.username} / <@${user.id}>\n**Nickname**: ${nickname}\n**ID**: \`${user.id}\`\n**Account Created**: ${timeCreated}`, inline: false },
                { name: '❗・Basic Server Info', value: `**Joined Server**: ${timeJoined}\n**Highest Role**: ${highestRoleName}`, inline: false },
                { name: '🔍・Roles', value: rolesDisplay, inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await message.channel.send({ embeds: [userInfoEmbed] });
    }
};
