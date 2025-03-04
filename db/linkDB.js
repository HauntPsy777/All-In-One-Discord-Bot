const sqlite3 = require("sqlite3").verbose();

class AntiLinkDB {
  constructor() {
    this.db = new sqlite3.Database("./anti-link.db", (err) => {
      if (err) console.error("❌ Database connection error:", err.message);
      else console.log("✅ Connected to the Anti-Link database.");
    });

    // Initialize tables
    this.initTables();
  }

  initTables() {
    // Create Anti-Link settings table
    this.db.run(
      `CREATE TABLE IF NOT EXISTS anti_link_settings (
        guild_id TEXT PRIMARY KEY,
        is_enabled INTEGER DEFAULT 0,
        log_channel TEXT
      )`,
      (err) => {
        if (err) console.error("❌ Error creating anti_link_settings table:", err.message);
      }
    );

    // Create Whitelisted Roles table
    this.db.run(
      `CREATE TABLE IF NOT EXISTS anti_link_whitelisted_roles (
        guild_id TEXT,
        role_id TEXT,
        PRIMARY KEY (guild_id, role_id)
      )`,
      (err) => {
        if (err) console.error("❌ Error creating anti_link_whitelisted_roles table:", err.message);
      }
    );

    // Ensure log_channel column exists
    this.ensureColumnExists("anti_link_settings", "log_channel", "TEXT");
  }

  ensureColumnExists(table, column, columnType) {
    this.db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) {
        console.error(`❌ Error checking table info for ${table}:`, err.message);
        return;
      }

      const columnExists = columns.some((col) => col.name === column);
      if (!columnExists) {
        console.log(`🔧 Adding ${column} column to ${table} table...`);
        this.db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${columnType}`, (alterErr) => {
          if (alterErr) console.error(`❌ Error adding ${column} column:`, alterErr.message);
          else console.log(`✅ ${column} column added successfully.`);
        });
      }
    });
  }

  // Get Anti-Link settings for a guild
  getSettings(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT is_enabled, log_channel FROM anti_link_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || { is_enabled: 0, log_channel: null });
        }
      );
    });
  }

  // Save Anti-Link settings for a guild
  saveSettings(guildId, isEnabled, logChannel) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO anti_link_settings (guild_id, is_enabled, log_channel)
         VALUES (?, ?, ?)
         ON CONFLICT(guild_id)
         DO UPDATE SET is_enabled = excluded.is_enabled, log_channel = excluded.log_channel`,
        [guildId, isEnabled, logChannel],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Add a role to the whitelist for Anti-Link (NO LOGGING)
  addWhitelistedRole(guildId, roleId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO anti_link_whitelisted_roles (guild_id, role_id)
         VALUES (?, ?)
         ON CONFLICT(guild_id, role_id) DO NOTHING`,
        [guildId, roleId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Get all whitelisted roles for a guild
  getWhitelistedRoles(guildId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT role_id FROM anti_link_whitelisted_roles WHERE guild_id = ?`,
        [guildId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map((row) => row.role_id));
        }
      );
    });
  }

  // Remove a role from the whitelist (NO LOGGING)
  removeWhitelistedRole(guildId, roleId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM anti_link_whitelisted_roles WHERE guild_id = ? AND role_id = ?`,
        [guildId, roleId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Get the log channel for Anti-Link logs
  getLogChannel(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT log_channel FROM anti_link_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.log_channel : null);
        }
      );
    });
  }

  // Check if Anti-Link is enabled for a guild
  isAntiLinkEnabled(guildId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT is_enabled FROM anti_link_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.is_enabled === 1 : false);
        }
      );
    });
  }
}

module.exports = new AntiLinkDB();
