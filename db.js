const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
    }
});

// **Ensure the users table has the lastDaily column**
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        username TEXT,
        coins INTEGER DEFAULT 0,
        lastDaily INTEGER DEFAULT 0
    );`, (tableErr) => {
        if (tableErr) {
            console.error('❌ Error creating users table:', tableErr.message);
        } else {
            console.log('✅ Users table verified (or created).');
        }
    });
});

module.exports = db;
