// setup-db.js — Run once to set up the entire database
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const setup = async () => {
    try {
        console.log('⏳ Resetting database...');

        // Drop old tables cleanly (order matters due to foreign keys)
        await pool.query(`DROP TABLE IF EXISTS listings;`);
        await pool.query(`DROP TABLE IF EXISTS users;`);
        console.log('🗑️  Old tables cleared.');

        // ── USERS TABLE ──────────────────────────────────────────
        await pool.query(`
            CREATE TABLE users (
                id            SERIAL        PRIMARY KEY,
                full_name     VARCHAR(100)  NOT NULL,
                email         VARCHAR(150)  UNIQUE NOT NULL,
                phone         VARCHAR(20),
                password_hash VARCHAR(255)  NOT NULL,
                province      VARCHAR(50),
                is_verified   BOOLEAN       DEFAULT FALSE,
                created_at    TIMESTAMP     DEFAULT NOW()
            );
        `);
        console.log('✅ users table created!');

        // ── LISTINGS TABLE ───────────────────────────────────────
        // specs = JSONB stores all category-specific fields
        // images = TEXT[] stores array of image paths
        await pool.query(`
            CREATE TABLE listings (
                id          SERIAL        PRIMARY KEY,
                user_id     INTEGER       REFERENCES users(id) ON DELETE CASCADE,
                category    VARCHAR(50)   NOT NULL,
                title       VARCHAR(200)  NOT NULL,
                price       NUMERIC(12,2) NOT NULL,
                currency    VARCHAR(10)   DEFAULT 'USD',
                description TEXT,
                province    VARCHAR(50),
                location    VARCHAR(100),
                images      TEXT[],
                specs       JSONB,
                is_featured BOOLEAN       DEFAULT FALSE,
                is_active   BOOLEAN       DEFAULT TRUE,
                views       INTEGER       DEFAULT 0,
                created_at  TIMESTAMP     DEFAULT NOW()
            );
        `);
        console.log('✅ listings table created!');

        // ── INDEXES ──────────────────────────────────────────────
        await pool.query(`CREATE INDEX idx_listings_category ON listings(category);`);
        await pool.query(`CREATE INDEX idx_listings_user_id  ON listings(user_id);`);
        await pool.query(`CREATE INDEX idx_listings_province ON listings(province);`);
        await pool.query(`CREATE INDEX idx_listings_specs    ON listings USING GIN(specs);`);
        console.log('✅ All indexes created!');

        console.log('');
        console.log('🎉 DATABASE READY! All tables and indexes are set up.');

    } catch (err) {
        console.error('❌ Setup error:', err.message);
    } finally {
        await pool.end();
    }
};

setup();