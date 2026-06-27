import 'dotenv/config';
import express from 'express';
import productRoutes  from './src/routes/productRoutes.js';
import authRoutes     from './src/routes/authRoutes.js';
import listingsRoutes from './src/routes/listingsRoutes.js';
import adminRoutes    from './src/routes/adminRoutes.js';
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

// ── 404 Handler ─────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});