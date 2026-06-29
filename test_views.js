import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function testViews() {
    try {
        console.log("Injecting fake views from 10 days ago...");
        
        // Let's create an artificial view_history on an active listing
        const res = await pool.query(`SELECT id FROM listings LIMIT 1`);
        if (res.rows.length === 0) {
            console.log("No listings found.");
            return;
        }
        const id = res.rows[0].id;
        
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const oldDateStr = tenDaysAgo.toISOString().split('T')[0];
        
        const fakeHistory = {
            [oldDateStr]: 15 // 15 views from 10 days ago
        };
        
        await pool.query(`UPDATE listings SET views = 15, view_history = $1 WHERE id = $2`, [fakeHistory, id]);
        console.log(`Listing ${id} artificially set to 15 views (all from 10 days ago).`);
        
        console.log("Running server sweep script to simulate background cleanup...");
        // We simulate the sweeper logic
        const historyCheck = await pool.query('SELECT view_history FROM listings WHERE id = $1', [id]);
        let history = historyCheck.rows[0].view_history || {};
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let totalViews = 0;
        let changed = false;
        
        for (const date in history) {
            if (new Date(date) < sevenDaysAgo) {
                delete history[date];
                changed = true;
            } else {
                totalViews += history[date];
            }
        }
        
        if (changed) {
            await pool.query(`UPDATE listings SET views = $1, view_history = $2 WHERE id = $3`, [totalViews, history, id]);
            console.log(`Cleaned up! Total views should now be 0. It is: ${totalViews}`);
        } else {
            console.log("No cleanup triggered.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

testViews();
