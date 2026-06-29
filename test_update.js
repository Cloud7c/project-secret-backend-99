import pool from './src/db.js';

const testUpdate = async () => {
    try {
        const id = 1; // Assuming listing id 1 exists
        const user_id = 1;
        const currentImages = ['img1', 'img2'];
        
        // Let's just do an explain or something, or test the query directly
        const result = await pool.query(
            `UPDATE listings
             SET title = COALESCE($1, title),
                 price = COALESCE($2::numeric, price),
                 currency = COALESCE($3, currency),
                 description = COALESCE($4, description),
                 province = COALESCE($5, province),
                 location = COALESCE($6, location),
                 condition = COALESCE($7, condition),
                 specs = $8,
                 images = $9
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            ['test', '100', 'USD', 'desc', 'prov', 'loc', 'cond', {}, currentImages, id, user_id]
        );
        console.log('Query succeeded!');
        process.exit(0);
    } catch (err) {
        console.error('Test query failed:', err.message);
        process.exit(1);
    }
};

testUpdate();
