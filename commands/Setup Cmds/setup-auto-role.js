const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const roleSetupDB = require("../../db/role-role-db"); // Import the role setup database

module.exports = {
  name: "setautorole",
  aliases: ['setrole'],
  description: "Set up an auto-role for new members in the guild.",
  usage: "<prefix>setup-auto-role <RoleID or @Role>",
  async execute(message, args) {
    // Check if the user has the required permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("You need **Manage Roles** permissions to use this command!");
      return message.reply({ embeds: [embed] });
    }

    // Handle incorrect usage (e.g., no role provided)
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ Please provide a role ID or mention. Example: `!setup-auto-role @Role` or `!setup-auto-role 123456789012345678`.");
      return message.reply({ embeds: [embed] });
    }

    // Extract role from mention or ID
    let role;
    const roleArg = args[0];

    if (message.mentions.roles.size) {
      role = message.mentions.roles.first(); // Get the mentioned role
    } else if (roleArg) {
      role = message.guild.roles.cache.get(roleArg); // Get the role by ID
    }

    // Handle invalid role
    if (!role) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ The provided role is invalid. Please mention a role or provide a valid role ID.");
      return message.reply({ embeds: [embed] });
    }

    // Check if the bot has permission to manage the role
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ I do not have permission to manage roles. Please ensure I have the **Manage Roles** permission.");
      return message.reply({ embeds: [embed] });
    }

    // Check if the role is higher than the bot's highest role
    if (role.position >= message.guild.members.me.roles.highest.position) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("⚠️ I cannot assign a role that is higher than or equal to my highest role.");
      return message.reply({ embeds: [embed] });
    }

    // Confirmation prompt
    const confirmationEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`Are you sure you want to set **${role.name}** as the auto-role for new members? React with ✅ to confirm or ❌ to cancel.`);

    const confirmationMessage = await message.reply({ embeds: [confirmationEmbed] });
    await confirmationMessage.react('✅'); // Confirm reaction
    await confirmationMessage.react('❌'); // Cancel reaction

    // Wait for the user's reaction
    const filter = (reaction, user) => {
      return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    try {
      const collected = await confirmationMessage.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] });
      const reaction = collected.first();

      // Handle confirmation or cancellation
      if (reaction.emoji.name === '✅') {
        await roleSetupDB.setAutoRole(message.guild.id, role.id); // Update the auto-role in the database
        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`<a:yes:1323943621233348679> Successfully set **${role.name}** as the auto-role for new members.`);
        await message.reply({ embeds: [successEmbed] });
      } else {
        const cancelEmbed = new EmbedBuilder()
          .setColor("Red")
          .setDescription("<a:now:1334568425623912508> Auto-role setup cancelled.");
        await message.reply({ embeds: [cancelEmbed] });
      }
    } catch (error) {
      // Handle timeout or errors
      const timeoutEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ Auto-role setup timed out. Please try again.");
      await message.reply({ embeds: [timeoutEmbed] });
    }
  },
};