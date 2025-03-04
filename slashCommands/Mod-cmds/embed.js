const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Send a custom embed using JSON.')
        .addStringOption(option =>
            option.setName('json')
                .setDescription('The JSON for the embed (must be valid JSON)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the embed to')
                .setRequired(true)),

    async execute(interaction) {
        // 🔒 Check if the user has "Manage Messages" permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You do not have permission to use this command.')
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }

        const jsonInput = interaction.options.getString('json');
        const channel = interaction.options.getChannel('channel');

        // 🔒 Check if the channel is a valid text channel
        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ The selected channel must be a text channel.')
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }

        // 🔒 Check if the bot has permission to send messages in the channel
        if (!channel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`❌ I do not have permission to send messages in ${channel}.`)
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }

        try {
            const jsonData = JSON.parse(jsonInput);
            const content = jsonData.content || '';

            let embeds = [];
            if (Array.isArray(jsonData.embeds)) {
                embeds = jsonData.embeds.map(embedData => {
                    try {
                        return new EmbedBuilder(embedData);
                    } catch (err) {
                        throw new Error('❌ One or more embeds contain invalid data. Please check the format.');
                    }
                });
            } else if (jsonData.embeds) {
                throw new Error('❌ The `embeds` field must be an array.');
            }

            await channel.send({ content, embeds });

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('✅ Embed sent successfully!')
                        .setColor('Green'),
                ],
                ephemeral: true,
            });

        } catch (error) {
            let errorMessage = '❌ An error occurred. Please check the JSON format and try again.';
            if (error instanceof SyntaxError) {
                errorMessage = '❌ Invalid JSON format. Ensure it is correctly formatted.';
            } else if (error.message.includes('Invalid JSON structure') || error.message.includes('embeds contain invalid data')) {
                errorMessage = error.message;
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(errorMessage)
                        .setColor('Red'),
                ],
                ephemeral: true,
            });
        }
    }
};