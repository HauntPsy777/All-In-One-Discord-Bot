const {
    Client,
    GatewayIntentBits,
    Partials,
} = require('discord.js');

const client = new Client({
    intents: [
        // Basic
        GatewayIntentBits.Guilds,

        // Messages
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,

        // Members / Presence
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,

        // Reactions
        GatewayIntentBits.GuildMessageReactions,

        // Direct Messages
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,

        // Server
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildIntegrations,

        // Voice
        GatewayIntentBits.GuildVoiceStates,

        // Scheduled Events
        GatewayIntentBits.GuildScheduledEvents,
    ],

    partials: [
        Partials.User,
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.Reaction,
    ],
});

module.exports = client;
