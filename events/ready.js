const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setStatus('idle');
    client.user.setActivity({
      type: ActivityType.Playing,
      name: `&help`,
    });
  },
};
