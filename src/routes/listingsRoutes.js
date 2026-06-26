// src/routes/listingsRoutes.js
import express from 'express';
import protect from '../middleware/auth.js';
import {
    createListing,
    getAllListings,
    getListingById,
    deleteListing
} from '../controllers/listingsController.js';

const router = express.Router();

// PUBLIC — anyone can browse listings
router.get('/',    getAllListings);
router.get('/:id', getListingById);

// PROTECTED — must be logged in
router.post('/',      protect, createListing);
router.delete('/:id', protect, deleteListing);

export default router;