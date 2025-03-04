const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'serveravatar',
    aliases: ['sa'], // Aliases for the command
    description: 'Displays the server avatar (icon).',
    usage: '&serveravatar [serverID]', // Usage guide
    async execute(message, args) {
        // Guide for correct usage
        if (args.length > 1) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Command Usage Guide')
                .setDescription('**Usage:** `&serveravatar [serverID]`\n\n**Examples:**\n`&serveravatar` - Show the current server\'s avatar\n`&serveravatar 123456789012345678` - Show the avatar of a server by ID');
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

        // Get the server icon URL (avatar)
        const serverAvatar = guild.iconURL({ dynamic: true, size: 1024 });

        if (serverAvatar) {
            // Create an embed to show the server avatar
            const avatarEmbed = new EmbedBuilder()
                .setColor('Random') // Set a random color
                .setTitle(`${guild.name}'s Avatar`)
                .setURL(serverAvatar) // URL to the server avatar
                .setImage(serverAvatar) // Main image for the server avatar
                .setTimestamp();

            // Create a download button
            const downloadButton = new ButtonBuilder()
                .setLabel('Download Avatar')
                .setStyle(ButtonStyle.Link) // This makes it open a link
                .setURL(serverAvatar); // URL will be the avatar image URL

            // Create action row for the button
            const row = new ActionRowBuilder().addComponents(downloadButton);

            await message.reply({ embeds: [avatarEmbed], components: [row] });
        } else {
            const noAvatarEmbed = new EmbedBuilder()
                .setColor('Red') // Set a color for the error message
                .setDescription('❌ This server does not have an avatar set.');

            await message.reply({ embeds: [noAvatarEmbed] });
        }
    },
};