const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "removerole",
  description: "Remove a role from a user.\nUsage: `removerole <@user/userID> <@role/roleID>`",
  async execute(message, args) {
    // Check if the user has the required permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('❌ You need the "Manage Roles" permission to use this command.')
            .setColor("Red"),
        ],
      });
    }

    // Check if the bot has the required permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('❌ I need the "Manage Roles" permission to remove roles.')
            .setColor("Red"),
        ],
      });
    }

    // Get the target user and role from mentions or IDs
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if (!target) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Please mention a user or provide their ID to remove the role from.")
            .setColor("Red"),
        ],
      });
    }

    if (!role) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Please mention a role or provide its ID to remove from the user.")
            .setColor("Red"),
        ],
      });
    }

    // Ensure the role is within the bot's manageable range
    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I cannot remove a role that is higher or equal to my highest role.")
            .setColor("Red"),
        ],
      });
    }

    // Check if the role is within the user's permission range
    if (
      role.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerId
    ) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You cannot remove a role that is higher or equal to your highest role.")
            .setColor("Red"),
        ],
      });
    }

    // Remove the role
    try {
      await target.roles.remove(role);
      const successEmbed = new EmbedBuilder()
        .setDescription(`✅ Successfully removed the role **${role.name}** from ${target.user.tag}.`)
        .setColor("Green");

      await message.reply({ embeds: [successEmbed] });

      // Log the role removal in a specified log channel
      const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Role Removed')
          .setDescription(`
**Removed By:** ${message.author} (${message.author.id})
**User:** ${target.user.tag} (${target.id})
**Role:** ${role.name} (${role.id})
          `)
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error('Error removing role:', error);

      // Handle errors
      const errorEmbed = new EmbedBuilder()
        .setDescription("❌ An error occurred while removing the role. Please try again later.")
        .setColor("Red");

      message.reply({ embeds: [errorEmbed] });
    }
  },
};