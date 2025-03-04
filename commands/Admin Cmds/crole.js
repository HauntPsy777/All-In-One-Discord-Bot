const { PermissionsBitField, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'crole',
  description: 'Create a new role in the server.\nUsage: `+crole <roleName> [color] [hoist] [permissions]`',
  aliases: ['newrole', 'rolecreate'],
  permissions: ['ManageRoles'],
  cooldown: 5, // Cooldown in seconds
  async execute(message, args) {
    // Check if the user has the required permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription('❌ You lack the required permissions to create roles.'),
        ],
      });
    }

    // Check if a role name is provided
    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setDescription('❌ Usage: `+crole <roleName> [color] [hoist] [permissions]`'),
        ],
      });
    }

    const roleName = args[0]; // Role name is the first argument
    const color = args[1] || '#000000'; // Default color is black
    const hoist = args[2] === 'true'; // Default is false
    const permissions = args[3] ? new PermissionsBitField(args[3].split(',')) : new PermissionsBitField();

    try {
      // Create the role with the specified name, color, hoist, and permissions
      const role = await message.guild.roles.create({
        name: roleName,
        color: color,
        hoist: hoist,
        permissions: permissions,
        reason: `Role created by ${message.author.tag}`,
      });

      // Send success message
      const successEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ Role **${role.name}** created successfully!`)
        .addFields(
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
          { name: 'Permissions', value: role.permissions.toArray().join(', ') || 'None', inline: false }
        );

      message.reply({ embeds: [successEmbed] });

      // Log the role creation in a specified log channel
      const logChannel = message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Role Created')
          .setDescription(`
**Created By:** ${message.author} (${message.author.id})
**Role Name:** ${role.name} (${role.id})
**Color:** ${role.hexColor}
**Hoist:** ${role.hoist ? 'Yes' : 'No'}
**Permissions:** ${role.permissions.toArray().join(', ') || 'None'}
          `)
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error('Error creating role:', error);

      // Send error message
      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription('❌ Failed to create the role. Ensure the role name, color, and permissions are valid and try again.');

      message.reply({ embeds: [errorEmbed] });
    }
  },
};