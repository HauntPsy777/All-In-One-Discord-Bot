const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

module.exports = {
    name: 'kiss',
    description: 'Send an anime kiss to someone 💋',
    execute: async (message, args) => {
        if (!args.length) {
            return message.reply('You need to mention someone to kiss! 😘');
        }

        // Check cooldown
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); // React instead of replying
        }

        // Set cooldown
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        try {
            const response = await fetch('https://api.giphy.com/v1/gifs/search?api_key=iEuG4dzwgPVgbENvfQIb330diPBn3YEm&q=anime+kiss&limit=50&offset=0&rating=g&lang=en&bundle=messaging_non_clips');
            const data = await response.json();
            
            if (!data.data.length) {
                return message.reply('No anime kiss GIFs found! 😢');
            }
            
            // Filter only anime-style kiss GIFs
            const animeKissGifs = data.data.filter(gif => gif.title.toLowerCase().includes('anime') || gif.slug.toLowerCase().includes('anime'));
            if (!animeKissGifs.length) {
                return message.reply('No specific anime kiss GIFs found! 😢');
            }

            const randomGif = animeKissGifs[Math.floor(Math.random() * animeKissGifs.length)].images.original.url;
            
            const embed = new EmbedBuilder()
                .setColor('#FFC0CB')
                .setTitle(`${message.author.username} kisses ${message.mentions.users.first().username} 💋`)
                .setImage(randomGif)
                .setTimestamp()
                .setFooter({ text: 'Spread the love! ❤️', iconURL: message.author.displayAvatarURL() });
            
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('Could not fetch an anime kiss GIF at the moment 😢');
        }
    }
};