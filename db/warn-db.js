const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./warnings.db');

// Initialize the table
db.run(`
    CREATE TABLE IF NOT EXISTS warn_setup (
        guild_id TEXT PRIMARY KEY,
        warn_first TEXT,
        warn_second TEXT,
        warn_last TEXT,
        warner_role TEXT,
        warning_logs TEXT
    )
`);

module.exports = {
    async setRoles(guildId, roles) {
        return new Promise((resolve, reject) => {
            db.run(
                `
                INSERT INTO warn_setup (guild_id, warn_first, warn_second, warn_last, warner_role, warning_logs)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(guild_id) DO UPDATE SET
                    warn_first = excluded.warn_first,
                    warn_second = excluded.warn_second,
                    warn_last = excluded.warn_last,
                    warner_role = excluded.warner_role,
                    warning_logs = excluded.warning_logs
                `,
                [guildId, roles.warn_first, roles.warn_second, roles.warn_last, roles.warner_role, roles.warning_logs],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    },
    async getRoles(guildId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM warn_setup WHERE guild_id = ?`,
                [guildId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },
};
