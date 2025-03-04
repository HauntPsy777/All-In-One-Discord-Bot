const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nick',
    description: "Change a user's nickname on the server.\nUsage: `nick <@user/userID> [newNickname]`",
    async execute(message, args) {
        // Check if the user has permission to manage nicknames
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need the `Manage Nicknames` permission to use this command.')
                ]
            });
        }

        // Ensure a member and nickname are provided
        const member = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        const newNickname = args.slice(1).join(' ');

        if (!member) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please mention a valid member or provide their ID.')
                ]
            });
        }

        // Check if the bot has permission to manage nicknames
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ I need the `Manage Nicknames` permission to change nicknames.')
                ]
            });
        }

        try {
            // Change the nickname
            await member.setNickname(newNickname || null); // Reset nickname if newNickname is empty

            // Send a confirmation embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully changed ${member.user.tag}'s nickname to **${newNickname || 'default'}**.`);

            message.reply({ embeds: [embed] });

            // Log the nickname change in a specified log channel
            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Nickname Changed')
                    .setDescription(`
**Changed By:** ${message.author} (${message.author.id})
**User:** ${member.user.tag} (${member.id})
**New Nickname:** ${newNickname || 'default'}
                    `)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error changing nickname:', error);

            // Handle errors
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ An error occurred while trying to change the nickname. Please try again later.');

            message.reply({ embeds: [errorEmbed] });
        }
    }
};