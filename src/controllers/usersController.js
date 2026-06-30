import pool from '../db.js';
import sharp from 'sharp';

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture, notify_messages, notify_approvals FROM users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user data.' });
    }
};

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

export const removeProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'UPDATE users SET profile_picture = NULL WHERE id = $1 RETURNING id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture',
            [userId]
        );
        res.status(200).json({ message: 'Profile picture removed successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error removing profile picture:', err);
        res.status(500).json({ error: 'Failed to remove profile picture.' });
    }
};

export const removeCoverPicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'UPDATE users SET cover_picture = NULL WHERE id = $1 RETURNING id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture',
            [userId]
        );
        res.status(200).json({ message: 'Cover picture removed successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error removing cover picture:', err);
        res.status(500).json({ error: 'Failed to remove cover picture.' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, notify_messages, notify_approvals } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET full_name = $1, phone = $2, notify_messages = $3, notify_approvals = $4 
             WHERE id = $5 
             RETURNING id, full_name, email, phone, province, is_verified, created_at, profile_picture, cover_picture, notify_messages, notify_approvals`,
            [full_name, phone, notify_messages, notify_approvals, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({
            message: 'Settings updated successfully',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Failed to update settings.' });
    }
};

import bcrypt from 'bcrypt';

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required to delete your account.' });
        }

        // Fetch user's password hash
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = userResult.rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        // Delete user (Listings should cascade if foreign key is set up with ON DELETE CASCADE. 
        // If not, we explicitly delete listings first)
        await pool.query('DELETE FROM listings WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ error: 'Failed to delete account.' });
    }
};
