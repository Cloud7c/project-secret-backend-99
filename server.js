import 'dotenv/config';
import express from 'express';
import productRoutes  from './src/routes/productRoutes.js';
import authRoutes     from './src/routes/authRoutes.js';
import listingsRoutes from './src/routes/listingsRoutes.js';
import adminRoutes    from './src/routes/adminRoutes.js';
import usersRoutes    from './src/routes/usersRoutes.js';
import './src/db.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ── API Routes ──────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/users',    usersRoutes);

// ── 404 Handler ─────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ── Background Sweeper for Rolling 7-Day Views ─────────────
import pool from './src/db.js';

const sweepOldViews = async () => {
    try {
        // Find all listings where view_history is not empty
        const result = await pool.query(`SELECT id, view_history FROM listings WHERE view_history != '{}'::jsonb`);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (let row of result.rows) {
            let history = row.view_history || {};
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

            // Only update if expired views were actually deleted
            if (changed) {
                await pool.query(`UPDATE listings SET views = $1, view_history = $2 WHERE id = $3`, [totalViews, history, row.id]);
            }
        }
    } catch (err) {
        console.error("Failed to sweep old views:", err);
    }
};

// Run immediately on start, then every 1 hour
sweepOldViews();
setInterval(sweepOldViews, 60 * 60 * 1000);