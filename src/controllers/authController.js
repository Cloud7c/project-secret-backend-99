// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

// ─────────────────────────────────────────────
// Helper — generates a signed JWT token
// ─────────────────────────────────────────────
const generateToken = (user) => {
    return jwt.sign(
        {
            id:        user.id,
            email:     user.email,
            full_name: user.full_name,
            is_admin:  user.is_admin || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export const registerUser = async (req, res) => {
    const { full_name, email, phone, password, province } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({
            error: 'Full name, email, and password are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters.'
        });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({
                error: 'An account with this email already exists.'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
                (full_name, email, phone, password_hash, province)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email, phone, province, is_admin, created_at`,
            [full_name, email.toLowerCase(), phone, password_hash, province]
        );

        const newUser = result.rows[0];

        // ✅ Generate token on register too
        const token = generateToken(newUser);

        return res.status(201).json({
            message: '🎉 Account created! Welcome to Zim AutoAgri.',
            token,
            user: newUser
        });

    } catch (err) {
        console.error('Register error:', err.message);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // ✅ Generate token on login
        const token = generateToken(user);

        return res.status(200).json({
            message: '✅ Login successful! Welcome back.',
            token,
            user: {
                id:          user.id,
                full_name:   user.full_name,
                email:       user.email,
                phone:       user.phone,
                province:    user.province,
                is_verified: user.is_verified,
                is_admin:    user.is_admin,
                created_at:  user.created_at,
                profile_picture: user.profile_picture,
                cover_picture: user.cover_picture
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
};