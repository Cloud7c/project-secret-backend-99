import express from 'express';
import protect from '../middleware/auth.js';
import multer from 'multer';
import { getMe, uploadProfilePicture, uploadCoverPicture, removeProfilePicture, removeCoverPicture, updateSettings, deleteAccount } from '../controllers/usersController.js';

const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Protect all user routes
router.use(protect);

router.get('/me', getMe);
router.post('/profile-picture', upload.single('image'), uploadProfilePicture);
router.post('/cover-picture', upload.single('image'), uploadCoverPicture);

router.delete('/profile-picture', removeProfilePicture);
router.delete('/cover-picture', removeCoverPicture);

router.put('/settings', updateSettings);
router.delete('/account', deleteAccount);

export default router;
