const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['a'],
    description: 'Displays a user\'s avatar with options to view their banner.',
    async execute(message, args) {
        // Get the user to display avatar for, defaulting to the message author
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;

        // Create the avatar embed
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Create the buttons for the banner and avatar
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('avatar')
                    .setLabel('Avatar')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true), // Avatar button is disabled since we are already displaying the avatar
                new ButtonBuilder()
                    .setCustomId('banner')
                    .setLabel('Banner')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Send the embed with buttons
        const msg = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // Interaction listener for the buttons
        const filter = (interaction) => interaction.user.id === message.author.id && interaction.message.id === msg.id;

        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'banner') {
                try {
                    // Fetch the user's banner (with fetch to ensure it's available)
                    const bannerURL = await user.fetch().then((userData) => userData.bannerURL({ size: 1024, dynamic: true }));

                    if (bannerURL) {
                        // Create an embed for the user's banner
                        const bannerEmbed = new EmbedBuilder()
                            .setColor('Random')
                            .setTitle(`${user.tag}'s Banner`)
                            .setImage(bannerURL)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setTimestamp();

                        // Update the message with the banner embed and the same buttons, but disable the banner button and enable the avatar button
                        const updatedRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('avatar')
                                    .setLabel('Avatar')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(false), // Enable avatar button
                                new ButtonBuilder()
                                    .setCustomId('banner')
                                    .setLabel('Banner')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true) // Disable banner button
                            );

                        // Update the message with the banner embed and the updated button states
                        await interaction.update({
                            embeds: [bannerEmbed],
                            components: [updatedRow]
                        });
                    } else {
                        // If the user doesn't have a banner, notify the user
                        await interaction.reply({
                            content: 'This user does not have a banner.',
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Error fetching banner:', error);
                    await interaction.reply({
                        content: 'There was an error fetching the banner.',
                        ephemeral: true
                    });
                }
            }

            if (interaction.customId === 'avatar') {
                // Create the avatar embed again if the Avatar button is clicked
                const avatarEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(`${user.tag}'s Avatar`)
                    .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                // Update the message with the avatar embed and the updated button states
                const updatedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('avatar')
                            .setLabel('Avatar')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true), // Disable avatar button
                        new ButtonBuilder()
                            .setCustomId('banner')
                            .setLabel('Banner')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(false) // Enable banner button
                    );

                // Update the message with the avatar embed and the updated button states
                await interaction.update({
                    embeds: [avatarEmbed],
                    components: [updatedRow]
                });
            }
        });

        collector.on('end', () => {
            // Disable all buttons after 1 minute
            row.components.forEach(button => button.setDisabled(true));
            msg.edit({ components: [row] });
        });
    },
};
