const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'banner',
    aliases: ['b'], // Aliases for the command
    description: 'Displays the banner of the mentioned user or user ID, as well as your own banner.',
    usage: '&banner [@user|userID]', // Usage guide
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 1) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&banner [@user|userID]`\n\n**Examples:**\n`&banner` - Show your own banner\n`&banner @User` - Show the banner of a mentioned user\n`&banner 123456789012345678` - Show the banner of a user by ID');
            return message.reply({ embeds: [guideEmbed] });
        }

        let user;
        if (args.length > 0) {
            // If an ID is provided, try to find the user by mention or ID
            if (message.mentions.users.size > 0) {
                user = message.mentions.users.first();
            } else if (/^\d+$/.test(args[0])) {
                // Fetch user by ID
                try {
                    user = await message.client.users.fetch(args[0]);
                } catch (error) {
                    return message.reply('❌ Could not find the user. Please check the user ID or mention.');
                }
            } else {
                return message.reply('❌ Please mention a user or provide a valid user ID.');
            }
        } else {
            // If no ID is provided, use the message author (the command user)
            user = message.author;
        }

        try {
            // Fetch the user's profile to access the banner
            const userProfile = await message.client.users.fetch(user.id, { force: true });

            // Get the user's banner URL
            const userBanner = userProfile.bannerURL({ dynamic: true, size: 1024 });

            if (userBanner) {
                // Create an embed to show the user's banner
                const bannerEmbed = new EmbedBuilder()
                    .setColor('Random') // Set a random color
                    .setTitle(`Banner of ${user.tag}`)
                    .setURL(userBanner) // URL to the banner
                    .setImage(userBanner) // Main image for the user's banner
                    .setTimestamp();

                // Create a download button
                const downloadButton = new ButtonBuilder()
                    .setLabel('Download Banner')
                    .setStyle(ButtonStyle.Link) // This makes it open a link
                    .setURL(userBanner); // URL will be the banner image URL

                // Create action row for the button
                const row = new ActionRowBuilder().addComponents(downloadButton);

                await message.reply({ embeds: [bannerEmbed], components: [row] });
            } else {
                const noBannerEmbed = new EmbedBuilder()
                    .setColor('Red') // Set a color for the error message
                    .setDescription(`❌ ${user.tag} does not have a banner set.`);

                await message.reply({ embeds: [noBannerEmbed] });
            }
        } catch (error) {
            console.error('❌ Error fetching user profile:', error.message);
            await message.reply('❌ Could not fetch the user profile. Please make sure the user ID is valid or mention the user.');
        }
    },
};