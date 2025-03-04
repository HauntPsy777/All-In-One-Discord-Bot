const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Create db directory if it doesn't exist
const dbDirectory = path.join(__dirname, "..", "db");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory);
}

// Connect to database
const db = new sqlite3.Database(path.join(dbDirectory, "verified.sqlite"));

// Initialize database tables
db.run(`CREATE TABLE IF NOT EXISTS verification_roles (
   guild_id TEXT PRIMARY KEY,
   verificator_role TEXT,
   unverified_role TEXT,
   verified_role TEXT,
   verified_female_role TEXT,
   verification_logs TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS verification_blacklist (
   guild_id TEXT,
   user_id TEXT,
   reason TEXT,
   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (guild_id, user_id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS verified_users (
   guild_id TEXT,
   user_id TEXT,
   username TEXT,
   verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   verificator_id TEXT,
   gender TEXT,
   PRIMARY KEY (guild_id, user_id)
)`);

class VerificationDB {
  // Verification Roles Methods
  static getRoles(guildId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM verification_roles WHERE guild_id = ?",
        [guildId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static setRoles(guildId, roles) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
               INSERT OR REPLACE INTO verification_roles 
               (guild_id, verificator_role, unverified_role, verified_role, verified_female_role, verification_logs)
               VALUES (?, ?, ?, ?, ?, ?)`);

      stmt.run(
        guildId,
        roles.verificator_role,
        roles.unverified_role,
        roles.verified_role,
        roles.verified_female_role,
        roles.verification_logs,
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );

      stmt.finalize();
    });
  }

  // Blacklist Methods
  static addToBlacklist(guildId, userId, reason = "No reason provided") {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
               INSERT OR REPLACE INTO verification_blacklist 
               (guild_id, user_id, reason) 
               VALUES (?, ?, ?)
           `);

      stmt.run(guildId, userId, reason, (err) => {
        if (err) reject(err);
        resolve();
      });

      stmt.finalize();
    });
  }

  static async getAllBlockedUsers(guildId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          bl.user_id, 
          bl.reason, 
          bl.timestamp,
          u.username
        FROM verification_blacklist bl
        LEFT JOIN verified_users u ON bl.user_id = u.user_id AND bl.guild_id = u.guild_id
        WHERE bl.guild_id = ?`,
        [guildId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static removeFromBlacklist(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM verification_blacklist WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static isBlacklisted(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM verification_blacklist WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static getBlacklistReason(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT reason FROM verification_blacklist WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row ? row.reason : null);
        }
      );
    });
  }

  static getAllBlacklisted(guildId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT user_id, reason FROM verification_blacklist WHERE guild_id = ?",
        [guildId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Verified Users Methods
  static addVerifiedUser(
    guildId,
    userId,
    username,
    verificatorId,
    gender = null
  ) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
               INSERT OR REPLACE INTO verified_users 
               (guild_id, user_id, username, verificator_id, gender)
               VALUES (?, ?, ?, ?, ?)
           `);

      stmt.run(guildId, userId, username, verificatorId, gender, (err) => {
        if (err) reject(err);
        resolve();
      });

      stmt.finalize();
    });
  }

  static removeVerifiedUser(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM verified_users WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static isVerified(guildId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM verified_users WHERE guild_id = ? AND user_id = ?",
        [guildId, userId],
        (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static getVerifiedUsers(guildId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT user_id, username, gender FROM verified_users WHERE guild_id = ?",
        [guildId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Existing Methods
  static deleteRoles(guildId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM verification_roles WHERE guild_id = ?",
        [guildId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static hasVerification(guildId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT 1 FROM verification_roles WHERE guild_id = ?",
        [guildId],
        (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static updateRole(guildId, roleType, roleId) {
    return new Promise((resolve, reject) => {
      if (
        ![
          "verificator_role",
          "unverified_role",
          "verified_role",
          "verified_female_role",
          "verification_logs",
        ].includes(roleType)
      ) {
        reject(new Error("Invalid role type"));
        return;
      }

      db.run(
        `UPDATE verification_roles SET ${roleType} = ? WHERE guild_id = ?`,
        [roleId, guildId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static close() {
    db.close();
  }
}

module.exports = VerificationDB;
