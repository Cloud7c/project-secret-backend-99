import pool from './src/db.js';

async function alterTable() {
    try {
        console.log('Adding columns to users table...');
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_picture VARCHAR(500)`);
        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Error altering table:', err);
    } finally {
        process.exit(0);
    }
}

alterTable();
