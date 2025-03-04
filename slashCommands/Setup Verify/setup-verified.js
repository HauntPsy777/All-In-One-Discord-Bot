const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const VerificationDB = require('../../db/verified-db');

module.exports = {
   data: new SlashCommandBuilder()
       .setName('setup_verif')
       .setDescription('Setup the verification system')
       .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
       .addRoleOption(option =>
           option.setName('verificator_role')
               .setDescription('Select the verificator role')
               .setRequired(true))
       .addRoleOption(option =>
           option.setName('role_removed')
               .setDescription('Select the unverified role')
               .setRequired(true))
       .addRoleOption(option =>
           option.setName('role_verified')
               .setDescription('Select the verified role')
               .setRequired(true))
       .addRoleOption(option =>
           option.setName('role_female')
               .setDescription('Select the verified female role')
               .setRequired(true))
       .addChannelOption(option =>
           option.setName('logs_channel')
               .setDescription('Select the verification logs channel')
               .setRequired(true)
               .addChannelTypes(ChannelType.GuildText)),

   async execute(interaction) {
       try {
           await interaction.deferReply({ ephemeral: true });

           const guild = interaction.guild;

           // Retrieve options
           const verificatorRole = interaction.options.getRole('verificator_role');
           const unverifiedRole = interaction.options.getRole('role_removed');
           const verifiedRole = interaction.options.getRole('role_verified');
           const verifiedFemaleRole = interaction.options.getRole('role_female');
           const logsChannel = interaction.options.getChannel('logs_channel');

           // Validate inputs
           if (!verificatorRole || !unverifiedRole || !verifiedRole || !verifiedFemaleRole || !logsChannel) {
               throw new Error('One or more roles/channels are missing. Please select valid options.');
           }

           // Ensure the bot has permission to manage roles and send messages in the logs channel
           if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
               throw new Error('I need the `Manage Roles` permission to set up the verification system.');
           }

           if (!logsChannel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
               throw new Error(`I don't have permission to send messages in ${logsChannel}.`);
           }

           const roles = {
               verificator_role: verificatorRole.id,
               unverified_role: unverifiedRole.id,
               verified_role: verifiedRole.id,
               verified_female_role: verifiedFemaleRole.id,
               verification_logs: logsChannel.id
           };

           // Save to database
           await VerificationDB.setRoles(guild.id, roles);

           // Success Embed
           const embed = new EmbedBuilder()
               .setColor(0x2B2D31)
               .setTitle('Verification System Setup')
               .setDescription(`
✅ **Successfully configured verification system!**

**Roles Configuration:**
➜ Verificator Role: <@&${roles.verificator_role}>
➜ Unverified Role: <@&${roles.unverified_role}>
➜ Verified Role: <@&${roles.verified_role}>
➜ Verified Female: <@&${roles.verified_female_role}>

**Logs Configuration:**
➜ Verification Logs: <#${roles.verification_logs}>`)
               .setTimestamp()
               .setFooter({
                   text: guild.name,
                   iconURL: guild.iconURL({ dynamic: true })
               });

           // Log to specified log channel
           const logEmbed = new EmbedBuilder()
               .setColor(0x2B2D31)
               .setTitle('Verification System Updated')
               .setDescription(`
**Updated by:** ${interaction.user}
**Action:** Setup Verification System

**New Configuration:**
➜ Verificator Role: <@&${roles.verificator_role}>
➜ Unverified Role: <@&${roles.unverified_role}>
➜ Verified Role: <@&${roles.verified_role}>
➜ Verified Female: <@&${roles.verified_female_role}>`)
               .setTimestamp();

           await logsChannel.send({ embeds: [logEmbed] }).catch(error => {
               console.warn('Failed to send log message:', error);
           });

           await interaction.editReply({
               embeds: [embed],
               ephemeral: true
           });

       } catch (error) {
           console.error('Setup Verification Error:', error);

           const errorEmbed = new EmbedBuilder()
               .setColor(0xFF0000)
               .setTitle('❌ Error')
               .setDescription(`An error occurred: ${error.message}`)
               .setTimestamp();

           await interaction.editReply({
               embeds: [errorEmbed],
               ephemeral: true
           });
       }
   }
};