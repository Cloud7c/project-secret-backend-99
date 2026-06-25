import express from 'express';
// 1. Import your new routes
import productRoutes from './src/routes/productRoutes.js';

const app = express();
const PORT = 3000;

// Serve static frontend files
app.use(express.static('public'));

// 2. Tell the server to use your routes!
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});