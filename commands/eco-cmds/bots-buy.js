const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'shop',
    description: 'Display bot purchase details and pricing',
    aliases: ['premium', 'pricing'], // Aliases for the command
    async execute(message, args) {
        try {
            // Check if the command is used incorrectly and provide a guide
            if (args.length > 0) {
                const guideEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Command Usage')
                    .setDescription(
                        '**Usage:** `!shop`\n' +
                        '**Description:** Displays the pricing and purchase details for Celestial Prime.\n' +
                        '**Aliases:** `&premium`, `&pricing`'
                    );
                return message.reply({ embeds: [guideEmbed] });
            }

            // Get the guild's icon URL (if available)
            const guildAvatar = message.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/xyz1234.png'; // Fallback image if no guild icon

            // Dynamic pricing data (can be fetched from a database or config file)
            const pricingData = [
                { name: 'Celestial Prime, 1 Server', price: '$4.99/month' },
                { name: 'Celestial Prime, 3 Servers', price: '$9.99/month' },
                { name: 'Celestial Prime, 5 Servers', price: '$14.99/month' },
            ];

            // Format pricing data for the embed
            const pricingList = pricingData
                .map((plan) => `**${plan.name}** | ${plan.price}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#5865F2') // Discord's brand color
                .setAuthor({
                    name: `${message.guild.name} ・ Celestial Shop`,
                    iconURL: guildAvatar,
                    url: 'https://discord.gg/FCY6Ze6y', // Link to your support server or website
                })
                .setDescription(
                    'Unlock exclusive features and benefits with **Celestial Prime**! Follow the steps below to get started:\n\n' +
                    '**Step 1**\n' +
                    '> • Send the exact amount of the subscription **$5 / Per Month**.\n\n' +
                    '**Step 2**\n' +
                    '> • Create a new ticket and provide a screenshot of the transaction with the **Transaction ID** visible.\n\n' +
                    '**Step 3**\n' +
                    '> • Wait patiently. Our team will review your payment and activate your premium benefits as soon as possible.\n\n' +
                    '\n\n' +
                    '**Plans and Pricing**\n' +
                    '```yaml\n' +
                    pricingList +
                    '```\n\n' +
                    '**Payment Methods**\n' +
                    '> • **[PayPal](https://www.paypal.com/)** - Secure and easy payments.\n' +
                    '> • **[Buy Me a Coffee](https://www.buymeacoffee.com/)** - Support us with a coffee!\n' +
                    '> • **[CH] (NotYet)** - Direct bank transfer.\n\n' +
                    '**Why Choose Celestial Prime?**\n' +
                    '> • **Access to exclusive features.**\n' +
                    '> • **Priority support and faster response times.**\n' +
                    '> • **Regular updates and improvements.**\n\n'
                )
                .setFooter({ text: 'Thank you for choosing Celestial Prime!' })
                .setThumbnail('https://media.discordapp.net/attachments/1340795137839730759/1341769047964123289/6f87106c1940bd51240df7df136ca228.png?ex=67b7334d&is=67b5e1cd&hm=de496d8220b49789d64c31444868fdd69bfdf116fa8aeacd3dcc3d1d1d1f6942&=&format=webp&quality=lossless&width=1614&height=1614'); // Add a thumbnail for visual appeal

            // Buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/FCY6Ze6y'),

                new ButtonBuilder()
                    .setLabel('Donate')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.buymeacoffee.com/'),

                new ButtonBuilder()
                    .setLabel('Buy Now')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.paypal.com/')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error executing shop command:', error);
            await message.reply('There was an error trying to execute that command!');
        }
    },
};