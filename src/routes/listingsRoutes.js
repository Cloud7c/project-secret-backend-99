import express from 'express';
import protect from '../middleware/auth.js';
import multer from 'multer';
import {
    createListing,
    getAllListings,
    getListingById,
    incrementListingViews,
    deleteListing,
    updateListing
} from '../controllers/listingsController.js';

const router = express.Router();

// Multer memory storage (we will compress with sharp in the controller before saving to disk)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per image
});

// PUBLIC — anyone can browse listings
router.get('/',    getAllListings);
router.get('/:id', getListingById);
router.post('/:id/view', incrementListingViews);

// PROTECTED — must be logged in
// Allow up to 5 images to be uploaded under the field name 'images'
router.post('/',      protect, upload.array('images', 5), createListing);
router.put('/:id',    protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);

export default router;