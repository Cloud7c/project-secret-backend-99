import pool from './src/db.js';

async function testSQL() {
    try {
        const seed = "123456789";
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
                        (('x' || substr(md5(id::text || $1), 1, 8))::bit(32)::bigint % 259200)
                      ELSE 0 END
                ) as sort_score
            FROM listings
            ORDER BY sort_score DESC
            LIMIT 5;
        `;
        const res = await pool.query(query, [seed]);
        console.log("Normal seed works:", res.rows.length);

        const query2 = `
            SELECT id FROM listings 
            ORDER BY (CASE WHEN is_featured THEN (('x' || substr(md5(id::text || $1), 1, 8))::bit(32)::bigint % 1000) / 1000.0 + 0.5 ELSE (('x' || substr(md5(id::text || $1), 1, 8))::bit(32)::bigint % 1000) / 1000.0 END) DESC
            LIMIT 1;
        `;
        const res2 = await pool.query(query2, [seed]);
        console.log("Shuffle seed works:", res2.rows.length);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
testSQL();
