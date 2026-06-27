import pool from '../db.js';
import sharp from 'sharp';

export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id; // From protect middleware

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        // Compress and resize to a 400x400 square for profile pics
        const webpBuffer = await sharp(req.file.buffer)
            .resize({ width: 400, height: 400, fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer();

        const base64Image = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

        // Update DB
        const result = await pool.query(
            'UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture',
            [base64Image, userId]
        );

        res.status(200).json({
            message: 'Profile picture updated successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Error uploading profile picture:', err);
        res.status(500).json({ error: 'Failed to upload profile picture.' });
    }
};

export const uploadCoverPicture = async (req, res) => {
    try {
        const userId = req.user.id; // From protect middleware

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        // Compress and resize for banner dimensions
        const webpBuffer = await sharp(req.file.buffer)
            .resize({ width: 1200, height: 400, fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer();

        const base64Image = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

        // Update DB
        const result = await pool.query(
            'UPDATE users SET cover_picture = $1 WHERE id = $2 RETURNING id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture',
            [base64Image, userId]
        );

        res.status(200).json({
            message: 'Cover picture updated successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Error uploading cover picture:', err);
        res.status(500).json({ error: 'Failed to upload cover picture.' });
    }
};
