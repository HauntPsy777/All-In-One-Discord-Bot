const sqlite3 = require("sqlite3").verbose();
const dbPath = "./db/role-setup.db";

class RoleSetupDB {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
      } else {
        console.log("Connected to RoleSetupDB.");
        this.init();
      }
    });
  }

  init() {
    const query = `
      CREATE TABLE IF NOT EXISTS role_settings (
          guild_id TEXT PRIMARY KEY,
          auto_role TEXT NOT NULL
      )
    `;
    this.db.run(query, (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
      }
    });
  }

  setAutoRole(guildId, autoRole) {
    const query = `
      INSERT OR REPLACE INTO role_settings (guild_id, auto_role)
      VALUES (?, ?)
    `;
    return new Promise((resolve, reject) => {
      this.db.run(query, [guildId, autoRole], (err) => {
        if (err) {
          console.error("Error saving auto role:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getAutoRole(guildId) {
    const query = `
      SELECT auto_role FROM role_settings WHERE guild_id = ?
    `;
    return new Promise((resolve, reject) => {
      this.db.get(query, [guildId], (err, row) => {
        if (err) {
          console.error("Error fetching auto role:", err.message);
          reject(err);
        } else {
          resolve(row ? row.auto_role : null);
        }
      });
    });
  }

  deleteAutoRole(guildId) {
    const query = `
      DELETE FROM role_settings WHERE guild_id = ?
    `;
    return new Promise((resolve, reject) => {
      this.db.run(query, [guildId], (err) => {
        if (err) {
          console.error("Error deleting auto role:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new RoleSetupDB();
