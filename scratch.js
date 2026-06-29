import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testWordSim() {
    try {
        const res = await pool.query(`SELECT 
            'Toyota Benz 2012' <% 'banzi' as match1, 
            word_similarity('banzi', 'Toyota Benz 2012') as sim1,
            'Toyota Benz 2012' <% 'benzi' as match2, 
            word_similarity('benzi', 'Toyota Benz 2012') as sim2
        `);
        console.log("WORD SIMILARITY TEST:", res.rows[0]);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        pool.end();
    }
}

testWordSim();
