// src/controllers/listingsController.js
import pool from '../db.js';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────────────
// POST /api/listings  — Create a new listing
// ─────────────────────────────────────────────────────────
export const createListing = async (req, res) => {
    try {
        const {
            user_id, category, title, price,
            currency, description, province,
            location, specs
        } = req.body;

        // 1. Validate the fields every listing must have
        if (!user_id || !category || !title || !price) {
            return res.status(400).json({
                error: 'user_id, category, title, and price are required.'
            });
        }

        // 2. Validate category is one we support
        const validCategories = [
            'vehicles', 'machinery', 'spares',
            'equipment', 'livestock', 'produce'
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // 3. Validate the user actually exists
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1', [user_id]
        );
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 4. Parse specs if it's a string (FormData sends strings)
        let parsedSpecs = {};
        if (specs) {
            try {
                parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
            } catch (e) {
                console.error("Failed to parse specs:", specs);
            }
        }

        // 5. Handle Image Uploads with Sharp
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `${crypto.randomUUID()}.webp`;
                const filepath = path.join(process.cwd(), 'uploads', filename);

                // Compress, resize to 1200px width max, convert to WebP
                await sharp(file.buffer)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(filepath);

                // Save the public path for the frontend
                uploadedImages.push(`/uploads/${filename}`);
            }
        }

        // 6. Save the listing — specs goes in as JSONB, images as TEXT[]
        const result = await pool.query(
            `INSERT INTO listings
                (user_id, category, title, price, currency,
                 description, province, location, images, specs)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [
                user_id, category, title, price,
                currency || 'USD', description,
                province, location,
                uploadedImages,
                parsedSpecs
            ]
        );

        console.log(`\n🎉 NEW LISTING CREATED: [${category}] ${title} by User ID ${user_id} with ${uploadedImages.length} images`);

        return res.status(201).json({
            message: '✅ Listing posted successfully!',
            listing: result.rows[0]
        });

    } catch (err) {
        console.error('Create listing error:', err.message);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/listings  — Get all listings (with filters)
// Usage: /api/listings?category=vehicles&province=Harare
// ─────────────────────────────────────────────────────────
export const getAllListings = async (req, res) => {
    const { 
        category, province, search, limit, user_id, shuffle,
        price_min, price_max, make, model, condition, transmission
    } = req.query;

    // Build a dynamic query based on what filters were sent
    let query  = `SELECT l.*, u.full_name AS seller_name, u.phone AS seller_phone
                  FROM listings l
                  JOIN users u ON l.user_id = u.id
                  WHERE l.is_active = TRUE`;
    const params = [];

    if (category) {
        params.push(category);
        query += ` AND l.category = $${params.length}`;
    }
    if (province && province !== 'All Provinces') {
        params.push(province);
        query += ` AND l.province = $${params.length}`;
    }
    if (search) {
        params.push(`%${search}%`);
        query += ` AND (l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`;
    }
    if (user_id) {
        params.push(user_id);
        query += ` AND l.user_id = $${params.length}`;
    }

    // ── NEW ADVANCED FILTERS ─────────────────────────────────
    if (price_min) {
        params.push(parseFloat(price_min));
        query += ` AND l.price >= $${params.length}`;
    }
    if (price_max) {
        params.push(parseFloat(price_max));
        query += ` AND l.price <= $${params.length}`;
    }
    if (make && make !== 'All Makes') {
        params.push(make);
        query += ` AND l.specs->>'make' = $${params.length}`;
    }
    if (model && model !== 'All Models') {
        params.push(model);
        query += ` AND l.specs->>'model' = $${params.length}`;
    }
    if (condition && condition !== 'Any') {
        params.push(condition);
        query += ` AND l.specs->>'condition' = $${params.length}`;
    }
    if (transmission && transmission !== 'Any') {
        params.push(transmission);
        query += ` AND l.specs->>'transmission' = $${params.length}`;
    }

    // ── HOMEPAGE ROTATION ALGORITHM ──────────────────────────
    if (shuffle === 'true') {
        query += ` AND l.is_featured = TRUE ORDER BY RANDOM()`;
    } else {
        query += ` ORDER BY l.is_featured DESC, l.created_at DESC`;
    }

    if (limit) {
        params.push(parseInt(limit, 10));
        query += ` LIMIT $${params.length}`;
    }

    try {
        const result = await pool.query(query, params);
        return res.status(200).json({
            count:    result.rows.length,
            listings: result.rows
        });
    } catch (err) {
        console.error('Get listings error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/listings/:id  — Get one listing by ID
// ─────────────────────────────────────────────────────────
export const getListingById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT *, (
                SELECT row_to_json(u)
                FROM (SELECT id, full_name, phone, province, is_verified, created_at
                      FROM users WHERE id = listings.user_id) u
             ) AS seller
             FROM listings
             WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        return res.status(200).json({ listing: result.rows[0] });

    } catch (err) {
        console.error('Get listing error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/listings/:id/view  — Increment view count
// ─────────────────────────────────────────────────────────
export const incrementListingViews = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE listings SET views = views + 1
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, views`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        return res.status(200).json({ message: 'View recorded.', views: result.rows[0].views });

    } catch (err) {
        console.error('Increment views error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────────
// DELETE /api/listings/:id  — Delete a listing
// ─────────────────────────────────────────────────────────
export const deleteListing = async (req, res) => {
    const { id }      = req.params;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required.' });
    }

    try {
        // Only the owner can delete their own listing
        const result = await pool.query(
            `DELETE FROM listings
             WHERE id = $1 AND user_id = $2
             RETURNING id, title`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Listing not found or you do not have permission to delete it.'
            });
        }

        return res.status(200).json({
            message: `✅ Listing "${result.rows[0].title}" deleted successfully.`
        });

    } catch (err) {
        console.error('Delete listing error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
};