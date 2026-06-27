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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Serve React Frontend ──────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
app.use('/uploads', express.static('uploads'));

// ── API Routes ──────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/users',    usersRoutes);

// ── React Router Catch-All ──────────────────────────────
// Send all non-API requests to React's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});