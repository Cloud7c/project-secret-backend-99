import pool from './src/db.js';

async function testSQL() {
    try {
        const query = `
            SELECT 
                id, 
                title, 
                is_featured,
                created_at,
                (
                    EXTRACT(EPOCH FROM created_at)
                    + CASE WHEN is_featured THEN 604800 ELSE 0 END
                    + CASE WHEN is_featured THEN 
                        (('x' || substr(md5(id::text || to_char(current_timestamp, 'YYYY-MM-DD-HH24')), 1, 8))::bit(32)::bigint % 259200)
                      ELSE 0 END
                ) as sort_score
            FROM listings
            ORDER BY sort_score DESC
            LIMIT 5;
        `;
        const res = await pool.query(query);
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
testSQL();
