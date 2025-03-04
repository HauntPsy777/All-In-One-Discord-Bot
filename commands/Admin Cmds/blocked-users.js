const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const VerificationDB = require("../../db/verified-db");

module.exports = {
  name: "sos-list",
  aliases: ["sus-list", "blocked"],
  description: "List all blocked users in the server (Administrators only).\nUsage: `sos-list`",
  async execute(message, args) {
    // Check if the user has Administrator permissions
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription("❌ You must be an Administrator to use this command!");
      return message.reply({ embeds: [embed] });
    }

    try {
      // Fetch all blocked users for the guild
      const blockedUsers = await VerificationDB.getAllBlockedUsers(message.guild.id);

      // If no blocked users are found, send an appropriate message
      if (!blockedUsers || blockedUsers.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setDescription("📋 No users are currently blocked in this server.");
        return message.reply({ embeds: [embed] });
      }

      // Get guild details
      const guild = message.guild;
      const guildIconURL = guild.iconURL() || 'https://example.com/default-icon.png'; // Default icon if guild doesn't have one

      // Pagination settings
      const usersPerPage = 5;
      const totalPages = Math.ceil(blockedUsers.length / usersPerPage);
      let currentPage = 1;

      // Function to create embed for a specific page
      const createEmbed = (page) => {
        const startIndex = (page - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToDisplay = blockedUsers.slice(startIndex, endIndex);

        return new EmbedBuilder()
          .setAuthor({ name: `🚫 Blocked Users | ${guild.name}` })
          .setColor(0xff0000)
          .setThumbnail(guildIconURL)
          .setDescription(`**Total Blocked Users:** ${blockedUsers.length}\n**Page:** ${page}/${totalPages}`)
          .addFields(
            usersToDisplay.map((user) => ({
              name: `User ID: ${user.user_id}`,
              value: `**Username:** ${user.username || "Unknown"}\n**Reason:** ${
                user.reason || "No reason provided"
              }\n**Blocked At:** <t:${Math.floor(
                new Date(user.timestamp).getTime() / 1000
              )}:F>`,
              inline: false,
            }))
          )
          .setTimestamp();
      };

      // Send the initial embed
      const embed = createEmbed(currentPage);
      const sentMessage = await message.reply({ embeds: [embed] });

      // Add pagination reactions if there are multiple pages
      if (totalPages > 1) {
        await sentMessage.react('⬅️');
        await sentMessage.react('➡️');

        // Create a reaction collector
        const filter = (reaction, user) => {
          return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const collector = sentMessage.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction) => {
          if (reaction.emoji.name === '⬅️' && currentPage > 1) {
            currentPage--;
          } else if (reaction.emoji.name === '➡️' && currentPage < totalPages) {
            currentPage++;
          }

          // Update the embed with the new page
          const updatedEmbed = createEmbed(currentPage);
          await sentMessage.edit({ embeds: [updatedEmbed] });

          // Remove the user's reaction
          await reaction.users.remove(message.author.id);
        });

        collector.on('end', () => {
          sentMessage.reactions.removeAll().catch(() => null);
        });
      }
    } catch (error) {
      console.error("Error retrieving blocked users:", error);

      // Send an error message if something goes wrong
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription("❌ An error occurred while retrieving blocked users.");
      message.reply({ embeds: [embed] });
    }
  },
};