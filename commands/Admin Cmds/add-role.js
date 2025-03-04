const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'addrole',
    description: 'Assign a role to a user using mentions.\nUsage: `!addrole @user @role`',
    async execute(message, args) {
        // Ensure the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You need the "Manage Roles" permission to use this command.')
                        .setColor('Red')
                ]
            });
        }

        // Ensure the bot has the required permissions
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ I need the "Manage Roles" permission to assign roles.')
                        .setColor('Red')
                ]
            });
        }

        // Get the target user
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ Please mention a user to assign the role to.\nUsage: `&addrole @user @role`')
                        .setColor('Red')
                ]
            });
        }

        // Get the role from the mention
        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ Please mention a role to assign to the user.\nUsage: `&addrole @user @role`')
                        .setColor('Red')
                ]
            });
        }

        // Ensure the role is assignable by the bot
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ I cannot assign a role that is higher or equal to my highest role.')
                        .setColor('Red')
                ]
            });
        }

        // Ensure the role is assignable by the user
        if (role.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You cannot assign a role that is higher or equal to your highest role.')
                        .setColor('Red')
                ]
            });
        }

        // Check if the user already has the role
        if (target.roles.cache.has(role.id)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`❌ ${target.user.tag} already has the role **${role.name}**.`)
                        .setColor('Red')
                ]
            });
        }

        // Assign the role
        try {
            await target.roles.add(role);
            // Send a success message
            const successEmbed = new EmbedBuilder()
                .setDescription(`✅ Successfully assigned the role **${role.name}** to ${target.user.tag}.`)
                .setColor('Green');

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error assigning role:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ An error occurred while assigning the role. Please check my permissions and try again.')
                        .setColor('Red')
                ]
            });
        }
    }
};