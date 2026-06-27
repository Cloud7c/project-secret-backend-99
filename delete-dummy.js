import pool from './src/db.js';

async function removeDummyData() {
    try {
        console.log('Connecting to database to remove dummy data...');
        const emails = [
            'tendai.moyo@gmail.com',
            'rumbi.ncube@yahoo.com',
            'tapiwa.c@hotmail.com',
            'nyasha.dube@gmail.com',
            'chiedza.m@outlook.com',
            'blessing.mutasa@gmail.com',
            'tatenda.chirwa@yahoo.com',
            'farai.m@gmail.com',
            'rudo.sibanda@outlook.com',
            'kuda.zimuto@gmail.com'
        ];

        // Delete listings created by these users first to avoid foreign key constraints (if no cascade)
        await pool.query(`DELETE FROM listings WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [emails]);
        console.log('Deleted dummy listings.');

        // Delete the users
        await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [emails]);
        console.log('Deleted dummy users.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

removeDummyData();
