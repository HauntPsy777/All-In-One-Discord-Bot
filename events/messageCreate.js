const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getPrefix } = require('../db/prefix');
const antiLinkDB = require('../db/linkDB');
const tokenLogDB = require('../db/tokenLogDB');

// Load emojis from JSON
const jsonPath = path.join(__dirname, '../json/emojis.json');
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {
            // Ignore bot messages and DMs
            if (message.author.bot || !message.guild) return;

            const member = message.guild.members.cache.get(message.author.id);

            /** -------------------------------
             * Anti-Token Detection
             * ------------------------------- */
            const suspiciousPatterns = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-]{27}/g;
            if (suspiciousPatterns.test(message.content)) {
                await message.delete();

                // Log the detection to a specified log channel
                const logChannelId = await tokenLogDB.getLogChannel(message.guild.id);
                if (logChannelId) {
                    const logChannel = message.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        await logChannel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Anti-Token Detection')
                                    .setDescription(
                                        `**User:** ${message.author.tag}\n**Reason:** Token Detected\n**Duration:** 30 Days (Reported to Admins)`
                                    )
                                    .setColor('Red')
                                    .setTimestamp()
                            ]
                        });
                    }
                }

                // Take server-side action against the user
                if (member) {
                    await member.kick('Token detected. Reported for investigation.')
                        .then(() => console.log(`Kicked user: ${message.author.tag}`))
                        .catch(err => console.error(`Failed to kick user: ${err}`));
                }
                return;
            }

            /** -------------------------------
             * Anti-Link Feature
             * ------------------------------- */
            const isAntiLinkEnabled = await antiLinkDB.getSettings(message.guild.id);
            if (isAntiLinkEnabled) {
                // Get whitelisted roles for Anti-Link
                const whitelistedRoles = await antiLinkDB.getWhitelistedRoles(message.guild.id);

                // Check if the user has a whitelisted role
                const hasWhitelistedRole = member.roles.cache.some(role => whitelistedRoles.includes(role.id));
                const hasAdminRole = member.permissions.has(PermissionsBitField.Flags.Administrator);  // Use PermissionsBitField.Flags

                // If the user doesn't have a whitelisted role and doesn't have admin permissions, delete the link
                if (!hasWhitelistedRole && !hasAdminRole) {
                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                    if (linkRegex.test(message.content)) {
                        await message.delete();
                        await message.channel
                            .send({ content: `- Links are not allowed in this server, ${message.author}.`})
                            .then(msg => setTimeout(() => msg.delete(), 5000)); // Auto-delete warning after 5 seconds
                        return;
                    }
                }
            }

            /** -------------------------------
             * Command Handling
             * ------------------------------- */
            const prefix = await getPrefix(message.guild.id);
            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            let command = message.client.commands.get(commandName);

            // Check for aliases
            if (!command) {
                for (const cmd of message.client.commands.values()) {
                    if (cmd.aliases && cmd.aliases.includes(commandName)) {
                        command = cmd;
                        break;
                    }
                }
            }

            // Execute the command if found
            if (command) {
                // Pass the client object as the third argument
                await command.execute(message, args, message.client);
            }
        } catch (error) {
            console.error('Error processing message:', error);

            // Handle unexpected errors
            const errors = json.emojis?.[4]?.errors || '⚠️';
            const errorEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `${errors} Oops! Something went wrong while processing your request. If this issue persists, please **[Contact Support](https://discord.gg/Qc9zuygR4k)**.`
                );
            await message.reply({ embeds: [errorEmbed] }).catch(console.error);
        }
    }
};