const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const WarnDB = require('../../db/warn-db'); // Ensure you have a database handler for the warn system.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_warn')
        .setDescription('Setup the warning system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('warner_role')
                .setDescription('Select the role for members who can issue warnings')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('warn_first')
                .setDescription('Select the role for the first warning')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('warn_second')
                .setDescription('Select the role for the second warning')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('warn_last')
                .setDescription('Select the role for the last warning')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('warning_logs')
                .setDescription('Select the warning logs channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;

            // Retrieve options
            const warnerRole = interaction.options.getRole('warner_role');
            const warnFirstRole = interaction.options.getRole('warn_first');
            const warnSecondRole = interaction.options.getRole('warn_second');
            const warnLastRole = interaction.options.getRole('warn_last');
            const warningLogsChannel = interaction.options.getChannel('warning_logs');

            // Validate inputs
            if (!warnerRole || !warnFirstRole || !warnSecondRole || !warnLastRole || !warningLogsChannel) {
                throw new Error('One or more roles/channels are missing. Please select valid options.');
            }

            // Ensure the bot has permission to manage roles and send messages in the logs channel
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                throw new Error('I need the `Manage Roles` permission to set up the warning system.');
            }

            if (!warningLogsChannel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
                throw new Error(`I don't have permission to send messages in ${warningLogsChannel}.`);
            }

            const roles = {
                warner_role: warnerRole.id,
                warn_first: warnFirstRole.id,
                warn_second: warnSecondRole.id,
                warn_last: warnLastRole.id,
                warning_logs: warningLogsChannel.id,
            };

            // Store the configuration in the database
            await WarnDB.setRoles(guild.id, roles);

            // Create the confirmation embed
            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle('Warning System Setup')
                .setDescription(`
✅ **Successfully configured warning system!**

**Roles Configuration:**
➜ First Warning Role: <@&${roles.warn_first}>
➜ Second Warning Role: <@&${roles.warn_second}>
➜ Last Warning Role: <@&${roles.warn_last}>
➜ Warner Role: <@&${roles.warner_role}>

**Logs Configuration:**
➜ Warning Logs: <#${roles.warning_logs}>
                `)
                .setTimestamp()
                .setFooter({
                    text: guild.name,
                    iconURL: guild.iconURL({ dynamic: true }),
                });

            // Log to specified log channel
            const logEmbed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle('Warning System Updated')
                .setDescription(`
**Updated by:** ${interaction.user}
**Action:** Setup Warning System

**New Configuration:**
➜ First Warning Role: <@&${roles.warn_first}>
➜ Second Warning Role: <@&${roles.warn_second}>
➜ Last Warning Role: <@&${roles.warn_last}>
➜ Warner Role: <@&${roles.warner_role}>`)
                .setTimestamp();

            await warningLogsChannel.send({ embeds: [logEmbed] }).catch(error => {
                console.warn('Failed to send log message:', error);
            });

            await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
            });

        } catch (error) {
            console.error('Setup Warning Error:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Error')
                .setDescription(`An error occurred: ${error.message}`)
                .setTimestamp();

            await interaction.editReply({
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};