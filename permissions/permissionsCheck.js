const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const permissionsMap = {
    [PermissionsBitField.Flags.CreateInstantInvite]: 'Create Instant Invite',
    [PermissionsBitField.Flags.KickMembers]: 'Kick Members',
    [PermissionsBitField.Flags.BanMembers]: 'Ban Members',
    [PermissionsBitField.Flags.Administrator]: 'Administrator',
    [PermissionsBitField.Flags.ManageChannels]: 'Manage Channels',
    [PermissionsBitField.Flags.ManageGuild]: 'Manage Server',
    [PermissionsBitField.Flags.AddReactions]: 'Add Reactions',
    [PermissionsBitField.Flags.ViewAuditLog]: 'View Audit Log',
    [PermissionsBitField.Flags.PrioritySpeaker]: 'Priority Speaker',
    [PermissionsBitField.Flags.Stream]: 'Stream',
    [PermissionsBitField.Flags.SendMessages]: 'Send Messages',
    [PermissionsBitField.Flags.SendTTSMessages]: 'Send TTS Messages',
    [PermissionsBitField.Flags.ManageMessages]: 'Manage Messages',
    [PermissionsBitField.Flags.EmbedLinks]: 'Embed Links',
    [PermissionsBitField.Flags.AttachFiles]: 'Attach Files',
    [PermissionsBitField.Flags.ReadMessageHistory]: 'Read Message History',
    [PermissionsBitField.Flags.MentionEveryone]: 'Mention Everyone',
    [PermissionsBitField.Flags.UseExternalEmojis]: 'Use External Emojis',
    [PermissionsBitField.Flags.ViewGuildInsights]: 'View Guild Insights',
    [PermissionsBitField.Flags.Connect]: 'Connect',
    [PermissionsBitField.Flags.Speak]: 'Speak',
    [PermissionsBitField.Flags.MuteMembers]: 'Mute Members',
    [PermissionsBitField.Flags.DeafenMembers]: 'Deafen Members',
    [PermissionsBitField.Flags.MoveMembers]: 'Move Members',
    [PermissionsBitField.Flags.UseVAD]: 'Use Voice Activity',
    [PermissionsBitField.Flags.ChangeNickname]: 'Change Nickname',
    [PermissionsBitField.Flags.ManageNicknames]: 'Manage Nicknames',
    [PermissionsBitField.Flags.ManageRoles]: 'Manage Roles',
    [PermissionsBitField.Flags.ManageWebhooks]: 'Manage Webhooks',
    [PermissionsBitField.Flags.ManageEmojisAndStickers]: 'Manage Emojis and Stickers',
    [PermissionsBitField.Flags.UseApplicationCommands]: 'Use Application Commands',
    [PermissionsBitField.Flags.RequestToSpeak]: 'Request to Speak',
    [PermissionsBitField.Flags.ManageEvents]: 'Manage Events',
    [PermissionsBitField.Flags.ManageThreads]: 'Manage Threads',
    [PermissionsBitField.Flags.CreatePublicThreads]: 'Create Public Threads',
    [PermissionsBitField.Flags.CreatePrivateThreads]: 'Create Private Threads',
    [PermissionsBitField.Flags.UseExternalStickers]: 'Use External Stickers',
    [PermissionsBitField.Flags.SendMessagesInThreads]: 'Send Messages in Threads',
    [PermissionsBitField.Flags.StartEmbeddedActivities]: 'Start Embedded Activities'
};

module.exports = {
    checkPermissions: (message, permissions) => {
        const missingPermissions = permissions.filter(permission => !message.member.permissions.has(permission));
        if (missingPermissions.length > 0) {
            const missingPermsDescription = missingPermissions.map(permission => permissionsMap[permission]).join(', ');
            const perm = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`You are missing the following permissions: \`\`${missingPermsDescription}\`\``);
            return message.reply({ embeds: [perm] });
        }
        return null;
    }
};
