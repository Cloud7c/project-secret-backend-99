import express from 'express';
import pool from '../db.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Secure all admin routes automatically
router.use(adminAuth);

// 1. Fetch All Users for Dashboard
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, email, phone, province, is_verified, created_at 
             FROM users ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin users:', err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// 2. Toggle Verify User Status
router.post('/users/:id/verify', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(
            `UPDATE users 
             SET is_verified = NOT is_verified 
             WHERE id = $1 
             RETURNING is_verified`,
            [userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User verification updated', is_verified: result.rows[0].is_verified });
    } catch (err) {
        console.error('Error toggling verification:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Fetch All Listings for Dashboard
router.get('/listings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT l.id, l.title, l.category, l.price, l.currency, l.images, l.is_featured, l.created_at,
                    u.full_name as seller_name
             FROM listings l
             JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin listings:', err);
        res.status(500).json({ error: 'Server error fetching listings' });
    }
});

// 4. Toggle Featured Listing Status
router.post('/listings/:id/feature', async (req, res) => {
    const listingId = req.params.id;
    try {
        const result = await pool.query(
            `UPDATE listings 
             SET is_featured = NOT is_featured 
             WHERE id = $1 
             RETURNING is_featured`,
            [listingId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
        res.json({ message: 'Listing feature status updated', is_featured: result.rows[0].is_featured });
    } catch (err) {
        console.error('Error toggling feature status:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. Dashboard Statistics — Real computed data
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        const verifiedUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_verified = TRUE');
        const pendingUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_verified = FALSE');
        const totalListings = await pool.query('SELECT COUNT(*) FROM listings');
        const featuredListings = await pool.query('SELECT COUNT(*) FROM listings WHERE is_featured = TRUE');
        
        // Listings created today
        const todayListings = await pool.query(
            `SELECT COUNT(*) FROM listings WHERE created_at >= CURRENT_DATE`
        );
        
        // Users registered today
        const todayUsers = await pool.query(
            `SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE`
        );

        // Total Traffic (Views)
        const totalTrafficResult = await pool.query('SELECT SUM(views) as total_views FROM listings');
        const totalTraffic = parseInt(totalTrafficResult.rows[0]?.total_views || 0);

        // Platform Fees Collected (Placeholder: 2% of total listing prices)
        const totalRevenueResult = await pool.query('SELECT SUM(price) as total_price FROM listings');
        const totalRevenue = (parseFloat(totalRevenueResult.rows[0]?.total_price || 0) * 0.02).toFixed(2);

        // Daily activity for the past 7 days (for bar chart)
        const dailyActivity = await pool.query(`
            SELECT 
                TO_CHAR(d.day, 'Dy') as day_name,
                COALESCE(u.user_count, 0) as new_users,
                COALESCE(l.listing_count, 0) as new_listings
            FROM generate_series(
                CURRENT_DATE - INTERVAL '6 days', 
                CURRENT_DATE, 
                '1 day'
            ) AS d(day)
            LEFT JOIN (
                SELECT DATE(created_at) as dt, COUNT(*) as user_count 
                FROM users GROUP BY DATE(created_at)
            ) u ON DATE(d.day) = u.dt
            LEFT JOIN (
                SELECT DATE(created_at) as dt, COUNT(*) as listing_count 
                FROM listings GROUP BY DATE(created_at)
            ) l ON DATE(d.day) = l.dt
            ORDER BY d.day ASC
        `);

        // Category breakdown
        const categoryData = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM listings 
            GROUP BY category
            ORDER BY count DESC
        `);

        res.json({
            total_users: parseInt(totalUsers.rows[0].count),
            verified_users: parseInt(verifiedUsers.rows[0].count),
            pending_users: parseInt(pendingUsers.rows[0].count),
            total_listings: parseInt(totalListings.rows[0].count),
            featured_listings: parseInt(featuredListings.rows[0].count),
            today_listings: parseInt(todayListings.rows[0].count),
            today_users: parseInt(todayUsers.rows[0].count),
            total_traffic: totalTraffic,
            total_revenue: parseFloat(totalRevenue),
            daily_activity: dailyActivity.rows,
            categories: categoryData.rows
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

export default router;
