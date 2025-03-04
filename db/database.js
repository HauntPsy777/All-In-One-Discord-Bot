const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, "../database.db"), (err) => {
  if (err) {
    console.error("❌ Error connecting to SQLite database:", err);
  } else {
    console.log("✅ Connected to SQLite database.");
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS antilink_settings (
      guild_id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS whitelisted_roles (
      guild_id TEXT,
      role_id TEXT,
      PRIMARY KEY (guild_id, role_id)
    )
  `);
}

// Export a function that returns a promise
module.exports = () => {
  return new Promise((resolve, reject) => {
    db.on("open", () => resolve(db));
    db.on("error", (err) => reject(err));
  });
};