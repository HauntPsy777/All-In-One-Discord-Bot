const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inrole',
    description: 'List all members with a specific role.\nUsage: `inrole <@role/roleName>`',
    async execute(message, args) {
        // Check if the user provided a role mention or name
        const role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());
        const guild = message.guild;

        // If no valid role is found
        if (!role) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Please mention a valid role or provide a role name.')
                ]
            });
        }

        // Fetch members with the role and format as mentions
        const members = role.members.map(member => `- <@${member.user.id}> | \`${member.user.id}\``);

        // Handle if there are no members
        if (members.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription(`❌ No members are currently assigned to the role **${role.name}**.`)
                ]
            });
        }

        // Pagination settings
        const membersPerPage = 10;
        const totalPages = Math.ceil(members.length / membersPerPage);
        let currentPage = 1;

        // Function to create embed for a specific page
        const createEmbed = (page) => {
            const startIndex = (page - 1) * membersPerPage;
            const endIndex = startIndex + membersPerPage;
            const membersToDisplay = members.slice(startIndex, endIndex);

            return new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: `${guild.name} | Users with the role: ${role.name}`, iconURL: guild.iconURL() })
                .setThumbnail(guild.iconURL())
                .setDescription(membersToDisplay.join('\n'))
                .setFooter({ text: `Page ${page}/${totalPages} | Requested by ${message.author.tag} | Total Members: ${members.length}`, iconURL: guild.iconURL() });
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
    }
};