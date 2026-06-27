import pool from './src/db.js';

async function fixTable() {
    try {
        console.log('Altering columns in users table to TEXT...');
        await pool.query(`ALTER TABLE users ALTER COLUMN profile_picture TYPE TEXT`);
        await pool.query(`ALTER TABLE users ALTER COLUMN cover_picture TYPE TEXT`);
        console.log('Columns altered successfully.');
    } catch (err) {
        console.error('Error altering table:', err);
    } finally {
        process.exit(0);
    }
}

fixTable();
