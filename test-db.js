import pool from './src/db.js';

async function checkListings() {
    try {
        const result = await pool.query('SELECT * FROM listings ORDER BY id DESC LIMIT 1;');
        console.log("=== LATEST LISTING IN DATABASE ===");
        if (result.rows.length > 0) {
            console.log(JSON.stringify(result.rows[0], null, 2));
        } else {
            console.log("No listings found in the database yet.");
        }
    } catch (err) {
        console.error("Error querying DB:", err);
    } finally {
        pool.end();
    }
}

checkListings();
