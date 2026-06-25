import express from 'express';
// Import the logic we just wrote!
import { getProductById } from '../controllers/productController.js';

const router = express.Router();

// When someone goes to /api/products/something, trigger our controller logic!
router.get('/:id', getProductById);

export default router;