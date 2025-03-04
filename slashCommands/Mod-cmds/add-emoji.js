const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Adds a custom emoji to the server.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji (Custom Discord emoji or image URL)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name for the emoji')
                .setRequired(true)),

    async execute(interaction) {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            const embedNoPermission = new EmbedBuilder()
                .setTitle('❌ Permission Denied')
                .setDescription('You need **Manage Emojis and Stickers** permission to use this command.')
                .setColor('Red');
            return interaction.reply({ embeds: [embedNoPermission], ephemeral: true });
        }

        const emojiInput = interaction.options.getString('emoji');
        const emojiName = interaction.options.getString('name');

        let emojiURL;

        // Check if it's a Unicode emoji (prevents adding it)
        if (/^[\p{Emoji}]+$/u.test(emojiInput)) {
            const embedInvalidUnicode = new EmbedBuilder()
                .setTitle('❌ Invalid Emoji')
                .setDescription('You cannot add standard Discord emojis as custom emojis.')
                .setColor('Red');
            return interaction.reply({ embeds: [embedInvalidUnicode], ephemeral: true });
        }

        // Check if it's a custom Discord emoji
        const customEmojiMatch = emojiInput.match(/<(a)?:\w+:(\d+)>/);
        if (customEmojiMatch) {
            emojiURL = `https://cdn.discordapp.com/emojis/${customEmojiMatch[2]}.${customEmojiMatch[1] ? 'gif' : 'png'}`;
        } else if (emojiInput.startsWith('http')) {
            // If it's a URL, use it directly
            emojiURL = emojiInput;
        } else {
            const embedInvalidInput = new EmbedBuilder()
                .setTitle('❌ Invalid Input')
                .setDescription('Please provide a **custom Discord emoji** or a **direct image URL**.')
                .setColor('Red');
            return interaction.reply({ embeds: [embedInvalidInput], ephemeral: true });
        }

        try {
            const addedEmoji = await interaction.guild.emojis.create({ attachment: emojiURL, name: emojiName });

            const embedSuccess = new EmbedBuilder()
                .setTitle('✅ Emoji Added Successfully!')
                .setDescription(`The emoji **:${addedEmoji.name}:** has been added.`)
                .setThumbnail(emojiURL)
                .setColor('Green');

            await interaction.reply({ embeds: [embedSuccess] });
        } catch (error) {
            console.error(error);

            const embedError = new EmbedBuilder()
                .setTitle('❌ Failed to Add Emoji')
                .setDescription('Ensure the URL is valid and the server has available emoji slots.')
                .setColor('Red');

            await interaction.reply({ embeds: [embedError], ephemeral: true });
        }
    },
};