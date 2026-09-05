const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'eventHandler',

    async execute(client) {
        const logChannelId = '1310617257423933494';

        // =========================
        // ROLE CREATE
        // =========================
        client.on('roleCreate', async (role) => {
            try {
                const logChannel = role.guild.channels.cache.get(logChannelId);
                if (!logChannel) return;

                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleCreate,
                    limit: 5,
                });

                const logEntry = auditLogs.entries.find(
                    entry =>
                        entry.target?.id === role.id &&
                        Date.now() - entry.createdTimestamp < 5000
                );

                const executor = logEntry?.executor;

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('🛠️ Role Created')
                    .setDescription(`A new role has been created: ${role}`)
                    .addFields(
                        {
                            name: 'Role Name',
                            value: role.name || 'Unknown',
                            inline: true,
                        },
                        {
                            name: 'Created By',
                            value: executor
                                ? `${executor} (\`${executor.id}\`)`
                                : 'Unknown',
                            inline: true,
                        }
                    )
                    .setTimestamp();

                await logChannel.send({
                    embeds: [embed],
                });
            } catch (error) {
                console.error('Error logging role creation:', error);
            }
        });

        // =========================
        // ROLE DELETE
        // =========================
        client.on('roleDelete', async (role) => {
            try {
                const logChannel = role.guild.channels.cache.get(logChannelId);
                if (!logChannel) return;

                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleDelete,
                    limit: 5,
                });

                const logEntry = auditLogs.entries.find(
                    entry =>
                        entry.target?.id === role.id &&
                        Date.now() - entry.createdTimestamp < 5000
                );

                const executor = logEntry?.executor;

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🗑️ Role Deleted')
                    .setDescription(
                        `A role has been deleted: **${role.name}**`
                    )
                    .addFields(
                        {
                            name: 'Role Name',
                            value: role.name || 'Unknown',
                            inline: true,
                        },
                        {
                            name: 'Deleted By',
                            value: executor
                                ? `${executor} (\`${executor.id}\`)`
                                : 'Unknown',
                            inline: true,
                        }
                    )
                    .setTimestamp();

                await logChannel.send({
                    embeds: [embed],
                });
            } catch (error) {
                console.error('Error logging role deletion:', error);
            }
        });

        // =========================
        // MEMBER ROLE UPDATE
        // =========================
        client.on('guildMemberUpdate', async (oldMember, newMember) => {
            try {
                const logChannel =
                    newMember.guild.channels.cache.get(logChannelId);

                if (!logChannel) return;

                // Roles added
                const addedRoles = newMember.roles.cache.filter(
                    role => !oldMember.roles.cache.has(role.id)
                );

                // Roles removed
                const removedRoles = oldMember.roles.cache.filter(
                    role => !newMember.roles.cache.has(role.id)
                );

                // Nothing changed
                if (addedRoles.size === 0 && removedRoles.size === 0) {
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setAuthor({
                        name: newMember.user.tag,
                        iconURL: newMember.user.displayAvatarURL({
                            extension: 'png',
                            size: 256,
                        }),
                    })
                    .setDescription(
                        `${newMember} had their roles updated.`
                    )
                    .setTimestamp();

                if (addedRoles.size > 0) {
                    embed.addFields({
                        name: '➕ Roles Added',
                        value: addedRoles
                            .map(role => `${role}`)
                            .join(', '),
                        inline: false,
                    });
                }

                if (removedRoles.size > 0) {
                    embed.addFields({
                        name: '➖ Roles Removed',
                        value: removedRoles
                            .map(role => `${role}`)
                            .join(', '),
                        inline: false,
                    });
                }

                await logChannel.send({
                    embeds: [embed],
                });
            } catch (error) {
                console.error(
                    'Error logging guild member update:',
                    error
                );
            }
        });
    },
};
