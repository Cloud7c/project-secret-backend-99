import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log("Connecting to database...");
        
        // Add the JSONB column for view history
        await pool.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_history JSONB DEFAULT '{}'`);
        
        // To preserve current views, we inject the current 'views' value into today's date
        // So they don't suddenly drop to 0!
        const today = new Date().toISOString().split('T')[0];
        await pool.query(`
            UPDATE listings 
            SET view_history = jsonb_build_object($1::text, views) 
            WHERE views > 0 AND (view_history IS NULL OR view_history::text = '{}')
        `, [today]);
        
        console.log("Successfully added view_history column and migrated existing views!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

runMigration();
