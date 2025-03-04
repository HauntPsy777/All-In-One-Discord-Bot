const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'serverbanner',
    aliases: ['sb'], // Aliases for the command
    description: 'Displays the server banner.',
    usage: '&serverbanner [serverID]', // Usage guide
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 1) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&serverbanner [serverID]`\n\n**Examples:**\n`&serverbanner` - Show the current server\'s banner\n`&serverbanner 123456789012345678` - Show the banner of a server by ID');
            return message.reply({ embeds: [guideEmbed] });
        }

        let guild;
        if (args[0]) {
            // Fetch server by ID if provided
            if (!/^\d+$/.test(args[0])) {
                return message.reply('❌ Please provide a valid server ID.');
            }
            try {
                guild = await message.client.guilds.fetch(args[0]);
            } catch (error) {
                return message.reply('❌ Could not find the server. Please check the server ID.');
            }
        } else {
            // Default to the current server
            guild = message.guild;
        }

        // Get the server banner URL
        const serverBanner = guild.bannerURL({ size: 1024, dynamic: true });

        if (serverBanner) {
            // Create an embed to show the server banner
            const bannerEmbed = new EmbedBuilder()
                .setColor('Random') // Set a random color
                .setTitle(`${guild.name}'s Banner`)
                .setURL(serverBanner) // URL to the server banner
                .setImage(serverBanner) // Main image for the server banner
                .setTimestamp();

            // Create a download button
            const downloadButton = new ButtonBuilder()
                .setLabel('Download Banner')
                .setStyle(ButtonStyle.Link) // This makes it open a link
                .setURL(serverBanner); // URL will be the banner image URL

            // Create action row for the button
            const row = new ActionRowBuilder().addComponents(downloadButton);

            await message.reply({ embeds: [bannerEmbed], components: [row] });
        } else {
            const noBannerEmbed = new EmbedBuilder()
                .setColor('Red') // Set a color for the error message
                .setDescription('❌ This server does not have a banner set.');

            await message.reply({ embeds: [noBannerEmbed] });
        }
    },
};