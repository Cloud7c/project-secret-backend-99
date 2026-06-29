import pool from './src/db.js';

async function updateSchema() {
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS notify_messages BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS notify_approvals BOOLEAN DEFAULT TRUE;
        `);
        console.log("Schema updated successfully.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        process.exit();
    }
}

updateSchema();
