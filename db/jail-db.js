const sqlite3 = require("sqlite3").verbose();

class JailDB {
  constructor() {
    this.db = new sqlite3.Database("./db/jail.db", (err) => {
      if (err) {
        console.error("Error connecting to SQLite database:", err.message);
      } else {
        console.log("Connected to SQLite database.");
        this.init();
      }
    });
  }

  // Initialize the database table if it doesn't exist
  init() {
    const createTableQuery1 = `
            CREATE TABLE IF NOT EXISTS jail_settings (
                guild_id TEXT PRIMARY KEY,
                jailer_role_id TEXT NOT NULL,
                jailed_role_id TEXT NOT NULL,
                logs_channel_id TEXT NOT NULL
            );
        `;
    const createTableQuery2 = `
            CREATE TABLE IF NOT EXISTS jailed_users (
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                jail_timestamp INTEGER NOT NULL,
                PRIMARY KEY (guild_id, user_id)
            );
        `;

    try {
      this.db.run(createTableQuery1, (err) => {
        if (err) {
          console.error("Error creating jail_settings table:", err.message);
        } else {
          console.log("jail_settings table checked/created successfully.");
        }
      });

      this.db.run(createTableQuery2, (err) => {
        if (err) {
          console.error("Error creating jailed_users table:", err.message);
        } else {
          console.log("jailed_users table checked/created successfully.");
        }
      });
    } catch (error) {
      console.error("Error initializing database tables:", error);
    }
  }

  // Save or update jail settings
  saveSettings(guildId, jailerRoleId, jailedRoleId, logsChannelId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO jail_settings (guild_id, jailer_role_id, jailed_role_id, logs_channel_id)
                 VALUES (?, ?, ?, ?)`,
        [guildId, jailerRoleId, jailedRoleId, logsChannelId],
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

  // Fetch settings for a specific guild
  getSettings(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM jail_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Add a user to the jail database
  addJailedUser(guildId, userId, jailTimestamp) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO jailed_users (guild_id, user_id, jail_timestamp)
                 VALUES (?, ?, ?)`,
        [guildId, userId, jailTimestamp],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Fetch jail timestamp for a specific user
  getJailTimestamp(guildId, userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT jail_timestamp FROM jailed_users WHERE guild_id = ? AND user_id = ?`,
        [guildId, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.jail_timestamp : null); // Return timestamp or null if not found
          }
        }
      );
    });
  }

  // Remove a user from the jail database (unjail)
  removeJailedUser(guildId, userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM jailed_users WHERE guild_id = ? AND user_id = ?`,
        [guildId, userId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Close the database connection (returns a promise for consistency)
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Closed database connection.");
          resolve();
        }
      });
    });
  }
}

module.exports = new JailDB();
