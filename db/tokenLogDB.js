const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'antiToken.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the antiToken database.');
    }
});

// Initialize the log channel table
db.run(`
  CREATE TABLE IF NOT EXISTS token_log_channels (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT
  )
`);

module.exports = {
    // Save the log channel for a guild
    saveLogChannel(guildId, channelId) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO token_log_channels (guild_id, channel_id)
                 VALUES (?, ?)
                 ON CONFLICT(guild_id)
                 DO UPDATE SET channel_id = excluded.channel_id`,
                [guildId, channelId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    },

    // Get the log channel for a guild
    getLogChannel(guildId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT channel_id FROM token_log_channels WHERE guild_id = ?`,
                [guildId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.channel_id : null);
                }
            );
        });
    }
};
