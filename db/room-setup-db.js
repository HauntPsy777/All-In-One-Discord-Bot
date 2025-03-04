const sqlite3 = require("sqlite3").verbose();
const dbPath = "./db/room-setup.db";

class RoomSetupDB {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
      } else {
        console.log("Connected to RoomSetupDB.");
        this.init();
      }
    });
  }

  init() {
    const query = `
         CREATE TABLE IF NOT EXISTS room_settings (
             guild_id TEXT PRIMARY KEY,
             log_channel TEXT NOT NULL,
             staff_role TEXT NOT NULL,
             room_category TEXT NOT NULL,
             join_channel TEXT NOT NULL,
             unverified_role TEXT NOT NULL
         )
     `;
    this.db.run(query, (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
      }
    });
  }

  setSettings(guildId, settings) {
    const query = `
         INSERT OR REPLACE INTO room_settings (
             guild_id, 
             log_channel, 
             staff_role, 
             room_category, 
             join_channel,
             unverified_role
         ) VALUES (?, ?, ?, ?, ?, ?)
     `;
    const params = [
      guildId,
      settings.log_channel,
      settings.staff_role,
      settings.room_category,
      settings.join_channel,
      settings.unverified_role,
    ];

    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
        if (err) {
          console.error("Error saving settings:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getSettings(guildId) {
    const query = `
         SELECT * FROM room_settings WHERE guild_id = ?
     `;

    return new Promise((resolve, reject) => {
      this.db.get(query, [guildId], (err, row) => {
        if (err) {
          console.error("Error fetching settings:", err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  deleteSettings(guildId) {
    const query = `
         DELETE FROM room_settings WHERE guild_id = ?
     `;

    return new Promise((resolve, reject) => {
      this.db.run(query, [guildId], (err) => {
        if (err) {
          console.error("Error deleting settings:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new RoomSetupDB();
