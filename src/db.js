// src/db.js
// This file creates ONE shared connection pool to PostgreSQL.
// A "pool" means we reuse connections instead of opening a new one
// for every single request — this is much faster and safer.

import pg from 'pg';
import dotenv from 'dotenv';

// Load the secret values from our .env file
dotenv.config();

const { Pool } = pg;

// Create the connection pool using our .env credentials
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase cloud connections
});

// Test the connection immediately when the server starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION FAILED:', err.message);
    } else {
        console.log('✅ PostgreSQL Connected Successfully!');
        release();
    }
});

export default pool;