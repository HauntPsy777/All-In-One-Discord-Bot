const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const WarnDB = require('../../db/warn-db');

module.exports = {
    name: 'warn',
    aliases: ['w'],
    usage: 'warn <@user/userID> <1/2/3> <reason>',
    description: 'Warn a user with a specific warning level (1, 2, or 3).\nUsage: `warn <@user/userID> <1/2/3> <reason>`',
    async execute(message, args) {
        try {
            // If no arguments are provided, show the command usage guide
            if (!args[0] || !args[1]) {
                const usageEmbed = new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setDescription(
                        `**How to use the command:**\n\`!warn <@user/userID> <1/2/3> <reason>\`\nExample: \`!warn @User 1 Breaking server rules\``
                    );

                return message.reply({ embeds: [usageEmbed] });
            }

            // Get the target user from mentions or ID
            const target =
                message.mentions.members.first() ||
                (await message.guild.members.fetch(args[0]).catch(() => null));

            if (!target) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ Please mention a valid user or provide their ID!'),
                    ],
                });
            }

            // Validate the warning level
            const warnLevel = parseInt(args[1]);
            if (!warnLevel || warnLevel < 1 || warnLevel > 3) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ Please provide a valid warning level: 1 (First), 2 (Second), or 3 (Last).'),
                    ],
                });
            }

            // Validate the reason
            const reason = args.slice(2).join(' ') || 'No reason provided.';
            if (reason.length > 1024) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ The reason must be less than 1024 characters.'),
                    ],
                });
            }

            // Get warning system roles from the database
            const roles = await WarnDB.getRoles(message.guild.id);
            if (!roles) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ Warning system is not set up in this server!'),
                    ],
                });
            }

            // Check if the command executor has the required permissions or roles
            const hasWarnerRole = message.member.roles.cache.has(roles.warner_role);
            const hasManageRoles = message.member.permissions.has(PermissionFlagsBits.ManageRoles);

            if (!hasWarnerRole && !hasManageRoles) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ You need Manage Roles permission or Warner role to use this command!'),
                    ],
                });
            }

            // Get the warning role for the specified level
            const warningRoles = {
                1: message.guild.roles.cache.get(roles.warn_first),
                2: message.guild.roles.cache.get(roles.warn_second),
                3: message.guild.roles.cache.get(roles.warn_last),
            };

            const warnRole = warningRoles[warnLevel];
            if (!warnRole) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription('❌ The warning role for this level is missing. Please check the setup!'),
                    ],
                });
            }

            // Add warning role to the user
            await target.roles.add(warnRole);

            // Send DM to the warned user
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle(`⚠️ You Have Been Warned`)
                .setDescription(`
You have been issued a **${warnLevel === 1 ? 'First' : warnLevel === 2 ? 'Second' : 'Last'} Warning** in **${message.guild.name}**.

**Reason:** ${reason}

Please adhere to the server rules to avoid further action.`)
                .setTimestamp();

            try {
                await target.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`Could not DM user ${target.user.tag}:`, error.message);
            }

            // Notify in the channel
            const successEmbed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setDescription(`✅ Successfully warned ${target} at level **${warnLevel}**.

➜ Added: <@&${warnRole.id}>
**Reason:** ${reason}`);

            await message.reply({ embeds: [successEmbed] });

            // Log the warning in the logs channel
            const logChannel = message.guild.channels.cache.get(roles.warning_logs);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle('Warning Issued')
                    .setAuthor({
                        name: `Warning Log`,
                        iconURL: message.guild.iconURL({ dynamic: true }),
                    })
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setDescription(`
**User:** ${target} (${target.id})
**Warned By:** ${message.author} (${message.author.id})
**Warning Level:** ${warnLevel}
**Reason:** ${reason}

**Role Modified:**
➜ Added: <@&${warnRole.id}>`)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Warn Command Error:', error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription('❌ An error occurred while issuing the warning. Please check my permissions and try again.'),
                ],
            });
        }
    },
};