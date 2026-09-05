const { EmbedBuilder } = require('discord.js');
const antiWebhookDB = require('../../db/webhookDB');

module.exports = {
    name: 'anti-webhook',
    aliases: ['antiwebhook'],
    description:
        'Enable or disable the anti-webhook feature.\nUsage: `+anti-webhook <on/off>`',

    async execute(message, args) {
        try {
            // Make sure the command is used inside a server
            if (!message.guild) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '❌ This command can only be used in a server.'
                            ),
                    ],
                });
            }

            // Server owner + developer
            const allowedUsers = [
                message.guild.ownerId,
                '1218034475775299688',
            ];

            if (!allowedUsers.includes(message.author.id)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '❌ Only the server owner or the developer can use this command.'
                            ),
                    ],
                });
            }

            // Show usage
            if (!args[0]) {
                const usageEmbed = new EmbedBuilder()
                    .setColor(0x2b2d31)
                    .setTitle('Anti-Webhook')
                    .setDescription(
                        '**Usage:**\n' +
                        '`+anti-webhook <on/off>`\n\n' +
                        '**Examples:**\n' +
                        '`+anti-webhook on` — Enable anti-webhook.\n' +
                        '`+anti-webhook off` — Disable anti-webhook.'
                    );

                return message.reply({
                    embeds: [usageEmbed],
                });
            }

            // Validate option
            const option = args[0].toLowerCase();

            if (!['on', 'off'].includes(option)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '❌ Invalid option. Please use `on` or `off`.\n\n' +
                                '**Usage:**\n' +
                                '`+anti-webhook <on/off>`\n\n' +
                                '**Examples:**\n' +
                                '`+anti-webhook on`\n' +
                                '`+anti-webhook off`'
                            ),
                    ],
                });
            }

            // Convert option to database value
            const isEnabled = option === 'on' ? 1 : 0;

            // Save settings
            await antiWebhookDB.saveSettings(
                message.guild.id,
                isEnabled
            );

            console.log(
                `[Anti-Webhook] ${message.guild.name} (${message.guild.id}) → ${option.toUpperCase()}`
            );

            // Success message
            const successEmbed = new EmbedBuilder()
                .setColor(option === 'on' ? 'Green' : 'Red')
                .setTitle('Anti-Webhook Updated')
                .setDescription(
                    `✅ Anti-Webhook has been **${option.toUpperCase()}**.`
                )
                .setFooter({
                    text: `Updated by ${message.author.tag}`,
                })
                .setTimestamp();

            await message.reply({
                embeds: [successEmbed],
            });

            // Find mod-logs channel
            const logChannel = message.guild.channels.cache.find(
                channel =>
                    channel.isTextBased() &&
                    channel.name === 'mod-logs'
            );

            if (!logChannel) return;

            // Log the action
            const logEmbed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle('🔧 Anti-Webhook Feature Updated')
                .addFields(
                    {
                        name: 'Action',
                        value: `Anti-Webhook has been **${option.toUpperCase()}**.`,
                        inline: false,
                    },
                    {
                        name: 'Updated By',
                        value: `${message.author} (\`${message.author.id}\`)`,
                        inline: true,
                    },
                    {
                        name: 'Server',
                        value: `${message.guild.name} (\`${message.guild.id}\`)`,
                        inline: true,
                    }
                )
                .setTimestamp();

            await logChannel.send({
                embeds: [logEmbed],
            });
        } catch (error) {
            console.error('[Anti-Webhook] Error:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    '❌ An error occurred while updating the Anti-Webhook settings.'
                );

            // Avoid crashing if the reply itself fails
            try {
                await message.reply({
                    embeds: [errorEmbed],
                });
            } catch (replyError) {
                console.error(
                    '[Anti-Webhook] Failed to send error message:',
                    replyError
                );
            }
        }
    },
};
