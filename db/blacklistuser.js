const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Create db directory if it doesn't exist
const dbDirectory = path.join(__dirname, "..", "db");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory);
}

// Connect to database
const db = new sqlite3.Database(path.join(dbDirectory, "blacklist-role.db"));

// Initialize database table
db.run(`CREATE TABLE IF NOT EXISTS role_blacklist (
   guild_id TEXT,
   user_id TEXT,
   role_id TEXT,
   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (guild_id, user_id, role_id)
)`);

class BlacklistUserDB {
  // Add user to role blacklist
  static addBlacklistRole(guildId, userId, roleId) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO role_blacklist 
        (guild_id, user_id, role_id) 
        VALUES (?, ?, ?)
      `);

      stmt.run(guildId, userId, roleId, (err) => {
        if (err) reject(err);
        resolve();
      });

      stmt.finalize();
    });
  }

  // Remove user from role blacklist
  static removeBlacklistRole(guildId, userId, roleId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM role_blacklist WHERE guild_id = ? AND user_id = ? AND role_id = ?",
        [guildId, userId, roleId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  // Get all blacklisted roles for a user
  static getBlacklistedRoles(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT role_id, timestamp FROM role_blacklist WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Check if user is blacklisted from a specific role
  static async isBlacklistedFromRole(guildId, userId, roleId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM role_blacklist 
         WHERE (guild_id = ? AND user_id = ? AND role_id = ?) 
         OR (guild_id = ? AND user_id = ? AND role_id = 'all')`,
        [guildId, userId, roleId, guildId, userId],
        (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        }
      );
    });
  }
  static close() {
    db.close();
  }
}

module.exports = BlacklistUserDB;
