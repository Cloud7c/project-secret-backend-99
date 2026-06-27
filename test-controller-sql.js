import pool from './src/db.js';

async function testFetch() {
    try {
        let query = "SELECT l.id FROM listings l WHERE 1=1";
        let params = [];
        const seed = "49281734";
        const limitVal = 8;
        const pageVal = 1;
        const offsetVal = 0;

        if (seed) {
            params.push(seed);
            query += ` ORDER BY (
                EXTRACT(EPOCH FROM l.created_at)
                + CASE WHEN l.is_featured THEN 604800 ELSE 0 END
                + CASE WHEN l.is_featured THEN 
                    (('x' || substr(md5(l.id::text || $${params.length}), 1, 8))::bit(32)::bigint % 259200)
                  ELSE 0 END
            ) DESC`;
        }

        params.push(limitVal + 1);
        query += ` LIMIT $${params.length}`;

        params.push(offsetVal);
        query += ` OFFSET $${params.length}`;

        console.log("Query:", query);
        console.log("Params:", params);

        const res = await pool.query(query, params);
        console.log("Rows:", res.rows.length);
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}
testFetch();
