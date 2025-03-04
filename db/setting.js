const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./logs.db'); // Make sure the path is correct

// Create the table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS logChannels (
        guildId TEXT PRIMARY KEY,
        logChannelId TEXT
    )
`);

// Function to set the log channel
function setLogChannel(guildId, logChannelId, callback) {
    const query = `
        INSERT INTO logChannels (guildId, logChannelId)
        VALUES (?, ?)
        ON CONFLICT(guildId) DO UPDATE SET logChannelId = excluded.logChannelId
    `;
    db.run(query, [guildId, logChannelId], function (err) {
        if (err) {
            console.error('Error setting log channel:', err);
            return callback(err);
        }
        callback(null);
    });
}

// Function to get the log channel
function getLogChannel(guildId, callback) {
    const query = `SELECT logChannelId FROM logChannels WHERE guildId = ?`;
    db.get(query, [guildId], (err, row) => {
        if (err) {
            console.error('Error fetching log channel:', err);
            return callback(err, null);
        }
        callback(null, row ? row.logChannelId : null);
    });
}

module.exports = {
    setLogChannel,
    getLogChannel
};
