import express from 'express';
import protect from '../middleware/auth.js';
import multer from 'multer';
import { uploadProfilePicture, uploadCoverPicture } from '../controllers/usersController.js';

const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Protect all user routes
router.use(protect);

router.post('/profile-picture', upload.single('image'), uploadProfilePicture);
router.post('/cover-picture', upload.single('image'), uploadCoverPicture);

export default router;
