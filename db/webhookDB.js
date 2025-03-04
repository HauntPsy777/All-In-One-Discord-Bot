const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "antiWebhook.sqlite"), (err) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err);
  } else {
    console.log("✅ Connected to the antiWebhook database.");
  }
});

// Function to check if a column exists and add it if missing
function checkAndAddColumn(columnName, tableName, columnType) {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`❌ Error checking table ${tableName}:`, err);
      return;
    }

    const columnExists = columns.some(col => col.name === columnName);
    if (!columnExists) {
      console.log(`🔧 Adding ${columnName} column to ${tableName} table...`);
      db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, (alterErr) => {
        if (alterErr) console.error(`❌ Error adding ${columnName} column:`, alterErr);
        else console.log(`✅ ${columnName} column added successfully.`);
      });
    }
  });
}

// Ensure required tables exist
db.run(`
  CREATE TABLE IF NOT EXISTS anti_webhook_settings (
    guild_id TEXT PRIMARY KEY,
    is_enabled INTEGER
  )
`);

// Check and add missing columns
checkAndAddColumn("log_channel", "anti_webhook_settings", "TEXT");

module.exports = {
  saveSettings(guildId, isEnabled, logChannel) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO anti_webhook_settings (guild_id, is_enabled, log_channel)
         VALUES (?, ?, ?)
         ON CONFLICT(guild_id) 
         DO UPDATE SET is_enabled = excluded.is_enabled, log_channel = excluded.log_channel`,
        [guildId, isEnabled, logChannel],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getSettings(guildId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT is_enabled, log_channel FROM anti_webhook_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },
};
