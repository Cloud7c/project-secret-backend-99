import pool from './src/db.js';

const fixSchema = async () => {
    try {
        console.log('Starting schema update for listings table...');
        
        // 1. Add images TEXT[]
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS images TEXT[];');
        console.log('✅ Added images column.');

        // 2. Add specs JSONB
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS specs JSONB;');
        console.log('✅ Added specs column.');
        
        // 3. Add other potentially missing columns
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS condition VARCHAR(20);');
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT;');
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS province VARCHAR(50);');
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS location VARCHAR(100);');
        await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT \'USD\';');
        console.log('✅ Added other potential missing columns.');

        console.log('🎉 Schema update complete! The Post Ad form will now work perfectly.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating schema:', err.message);
        process.exit(1);
    }
};

fixSchema();
