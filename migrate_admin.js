import 'dotenv/config';
import pool from './src/db.js';

async function migrate() {
    try {
        console.log('Migrating database...');
        // 1. Add is_admin column if it doesn't exist
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;');
        console.log('Added is_admin column.');

        // 2. First reset all to false (just in case)
        await pool.query('UPDATE users SET is_admin = FALSE;');

        // 3. Delete the old admin email so it no longer exists
        await pool.query("DELETE FROM users WHERE email = 'admin@zimautoagri.com'");
        console.log('Deleted old admin@zimautoagri.com account.');

        // 4. Set coniliouskailash3@gmail.com as the only admin
        const adminEmail = 'coniliouskailash3@gmail.com';
        const res = await pool.query('UPDATE users SET is_admin = TRUE WHERE email = $1 RETURNING id, email', [adminEmail]);
        
        if (res.rows.length > 0) {
            console.log(`Successfully elevated ${adminEmail} to admin!`);
        } else {
            console.log(`Warning: User ${adminEmail} not found in database. Make sure to register this account.`);
        }
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
        process.exit();
    }
}

migrate();
