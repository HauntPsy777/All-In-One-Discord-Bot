const { EmbedBuilder } = require('discord.js');
const { setPrefix } = require('../../db/prefix');

module.exports = {
    name: 'setprefix',
    description: 'Set a custom prefix for this server.',
    cooldown: 10,
    userPerms: ['Administrator'], // Only users with Administrator permissions can use this command
    botPerms: ['ManageGuild'], // Bot requires ManageGuild permission to update the prefix
    async execute(message, args) {
        // Check if the user has Administrator permissions
        if (!message.member.permissions.has('Administrator')) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('<a:now:1334568425623912508> You need **Administrator** permissions to use this command!');
            return message.reply({ embeds: [embed] });
        }

        // Handle incorrect usage (e.g., no prefix provided)
        const newPrefix = args[0];
        if (!newPrefix) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ Please provide a new prefix. Example: `!setprefix !`');
            return message.reply({ embeds: [embed] });
        }

        // Validate the prefix length and characters
        if (newPrefix.length > 5) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ The prefix cannot be longer than 5 characters.');
            return message.reply({ embeds: [embed] });
        }

        if (newPrefix.includes(' ')) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ The prefix cannot contain spaces.');
            return message.reply({ embeds: [embed] });
        }

        // Confirmation prompt
        const confirmationEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`Are you sure you want to set the prefix to \`${newPrefix}\`? React with ✅ to confirm or ❌ to cancel.`);

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
                await setPrefix(message.guild.id, newPrefix); // Update the prefix in the database
                const successEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`<a:yes:1323943621233348679> Prefix successfully updated to \`${newPrefix}\``);
                await message.reply({ embeds: [successEmbed] });
            } else {
                const cancelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<a:now:1334568425623912508> Prefix update cancelled.');
                await message.reply({ embeds: [cancelEmbed] });
            }
        } catch (error) {
            // Handle timeout or errors
            const timeoutEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('⚠️ Prefix update timed out. Please try again.');
            await message.reply({ embeds: [timeoutEmbed] });
        }
    },
};