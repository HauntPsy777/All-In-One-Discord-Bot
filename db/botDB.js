// AntiBot database setup
const sqlite3 = require("sqlite3").verbose();

class AntiBotDB {
    constructor() {
        this.db = new sqlite3.Database("./database.sqlite", (err) => {
            if (err) {
                console.error("❌ Error connecting to SQLite database:", err.message);
            } else {
                console.log("✅ Connected to SQLite database.");
                this.init();
            }
        });
    }

    // Initialize the database table
    init() {
        this.db.run(
            `CREATE TABLE IF NOT EXISTS anti_bot_settings (
                guild_id TEXT PRIMARY KEY,
                is_enabled INTEGER DEFAULT 0,
                log_channel TEXT
            )`,
            (err) => {
                if (err) console.error("❌ Error creating table:", err.message);
            }
        );

        // Ensure the `log_channel` column exists
        this.db.all(`PRAGMA table_info(anti_bot_settings)`, (err, columns) => {
            if (err) {
                console.error("❌ Error checking table info:", err.message);
                return;
            }

            const columnExists = columns.some((col) => col.name === "log_channel");

            if (!columnExists) {
                console.log("🔧 Adding `log_channel` column to anti_bot_settings table...");
                this.db.run(`ALTER TABLE anti_bot_settings ADD COLUMN log_channel TEXT`, (alterErr) => {
                    if (alterErr) console.error("❌ Error adding column:", alterErr.message);
                    else console.log("✅ `log_channel` column added successfully.");
                });
            }
        });
    }

    // Save or update the anti-bot settings and log channel
    saveSettings(guildId, isEnabled, logChannel) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO anti_bot_settings (guild_id, is_enabled, log_channel)
                 VALUES (?, ?, ?)
                 ON CONFLICT(guild_id)
                 DO UPDATE SET is_enabled = excluded.is_enabled, log_channel = excluded.log_channel`,
                [guildId, isEnabled, logChannel],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, changes: this.changes });
                    }
                }
            );
        });
    }

    // Fetch anti-bot status and log channel for a specific guild
    getSettings(guildId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT is_enabled, log_channel FROM anti_bot_settings WHERE guild_id = ?`,
                [guildId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || { is_enabled: 0, log_channel: null });
                    }
                }
            );
        });
    }
}

module.exports = new AntiBotDB();
