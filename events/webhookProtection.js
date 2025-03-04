const antiWebhookDB = require('../db/webhookDB');

module.exports = {
  name: 'webhookUpdate',
  async execute(channel) {
    const guild = channel.guild;

    try {
      const isEnabled = await antiWebhookDB.getSettings(guild.id);
      if (!isEnabled) return;

      // Fetch webhooks in the channel
      const webhooks = await channel.fetchWebhooks();
      webhooks.forEach(async (webhook) => {
        // Check if the webhook was created by an unauthorized user
        if (!webhook.owner.bot) {
          try {
            await webhook.delete();
            console.log(`Deleted unauthorized webhook in ${guild.name}`);
          } catch (err) {
            console.error(`Failed to delete webhook in ${guild.name}:`, err);
          }
        }
      });
    } catch (err) {
      console.error('Error fetching anti-webhook settings:', err);
    }
  },
};
