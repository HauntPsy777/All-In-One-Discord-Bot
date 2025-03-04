const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'eventHandler',
    async execute(client) {
        const logChannelId = '1310617257423933494'; // Replace with the ID of your logging channel

        // Role Create Event
        client.on('roleCreate', async (role) => {
            try {
                const logChannel = role.guild.channels.cache.get(logChannelId);
                if (!logChannel) return;

                // Fetch audit logs to identify the user who created the role
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: 'ROLE_CREATE',
                    limit: 1,
                });
                const logEntry = auditLogs.entries.first();
                const executor = logEntry ? logEntry.executor : null;

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('🛠️ Role Created')
                    .setDescription(`A new role has been created: ${role}`)
                    .addFields(
                        { name: 'Role Name', value: role.name, inline: true },
                        { name: 'Created By', value: executor ? `${executor.tag} (${executor.id})` : 'Unknown', inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error logging role creation:', error);
            }
        });

        // Role Delete Event
        client.on('roleDelete', async (role) => {
            try {
                const logChannel = role.guild.channels.cache.get(logChannelId);
                if (!logChannel) return;

                // Fetch audit logs to identify the user who deleted the role
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: 'ROLE_DELETE',
                    limit: 1,
                });
                const logEntry = auditLogs.entries.first();
                const executor = logEntry ? logEntry.executor : null;

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🗑️ Role Deleted')
                    .setDescription(`A role has been deleted: **${role.name}**`)
                    .addFields(
                        { name: 'Role Name', value: role.name, inline: true },
                        { name: 'Deleted By', value: executor ? `${executor.tag} (${executor.id})` : 'Unknown', inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error logging role deletion:', error);
            }
        });

        // Guild Member Update Event
        client.on('guildMemberUpdate', async (oldMember, newMember) => {
            try {
                const logChannel = newMember.guild.channels.cache.get(logChannelId);

                // Compare roles
                const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
                const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                if (addedRoles.size > 0 || removedRoles.size > 0) {
                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTimestamp()
                        .setAuthor({
                            name: newMember.user.tag,
                            iconURL: newMember.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription(`${newMember} had their roles updated.`);

                    if (addedRoles.size > 0) {
                        embed.addFields({
                            name: 'Roles Added',
                            value: addedRoles.map(role => role.toString()).join(', '),
                            inline: true,
                        });
                    }

                    if (removedRoles.size > 0) {
                        embed.addFields({
                            name: 'Roles Removed',
                            value: removedRoles.map(role => role.toString()).join(', '),
                            inline: true,
                        });
                    }

                    if (logChannel) {
                        await logChannel.send({ embeds: [embed] });
                    }
                }
            } catch (error) {
                console.error('Error logging guild member update:', error);
            }
        });
    },
};
