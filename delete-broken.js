import pool from './src/db.js';

async function deleteBrokenListings() {
    try {
        const query = `
            DELETE FROM listings 
            WHERE array_to_string(images, ',') LIKE '%/uploads/%' 
            RETURNING id, title;
        `;
        const res = await pool.query(query);
        console.log(`Deleted ${res.rowCount} listings:`);
        console.dir(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

deleteBrokenListings();
