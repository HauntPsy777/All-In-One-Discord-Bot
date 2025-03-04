const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMembers, // Requires PRIVILEGED INTENT
	GatewayIntentBits.GuildPresences, // Requires PRIVILEGED INTENT
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent, // Requires PRIVILEGED INTENT
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.GuildWebhooks,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildVoiceStates,
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
