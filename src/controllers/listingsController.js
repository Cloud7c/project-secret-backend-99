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

        // 3. Validate the user actually exists and check verification status
        const userCheck = await pool.query(
            'SELECT id, is_verified FROM users WHERE id = $1', [user_id]
        );
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const isVerified = userCheck.rows[0].is_verified || false;

        // 4. Parse specs if it's a string (FormData sends strings)
        let parsedSpecs = {};
        if (specs) {
            try {
                parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
            } catch (e) {
                console.error("Failed to parse specs:", specs);
            }
        }

        // 5. Handle Image Uploads with Sharp (Base64 Database Storage)
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Compress, resize to 1200px width max, convert to WebP buffer
                const webpBuffer = await sharp(file.buffer)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 60 }) // compress a bit more for base64 storage
                    .toBuffer();

                // Convert buffer to base64 Data URI
                const base64Image = `data:image/webp;base64,${webpBuffer.toString('base64')}`;
                
                // Save the base64 string directly (no local file created)
                uploadedImages.push(base64Image);
            }
        }

        // 6. Save the listing — specs goes in as JSONB, images as TEXT[]
        const result = await pool.query(
            `INSERT INTO listings
                (user_id, category, title, price, currency,
                 description, province, location, images, specs, is_featured)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                user_id, category, title, price,
                currency || 'USD', description,
                province, location,
                uploadedImages,
                parsedSpecs,
                isVerified
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
        price_min, price_max, make, model, condition, transmission, type, breed, sort, page, exclude_id
    } = req.query;

    // Build a dynamic query based on what filters were sent
    let query  = `SELECT l.*, u.full_name AS seller_name, u.phone AS seller_phone
                  FROM listings l
                  JOIN users u ON l.user_id = u.id
                  WHERE l.is_active = TRUE`;
    const params = [];

    if (exclude_id) {
        params.push(exclude_id);
        query += ` AND l.id != $${params.length}`;
    }
    if (category) {
        params.push(category);
        query += ` AND l.category = $${params.length}`;
    }
    if (province && province !== 'All Provinces') {
        params.push(province);
        query += ` AND l.province = $${params.length}`;
    }
    if (search) {
        const spaceAgnosticSearch = `%${search.replace(/\s+/g, '')}%`;
        params.push(spaceAgnosticSearch);
        query += ` AND (
            REPLACE(l.title, ' ', '') ILIKE $${params.length} OR 
            REPLACE(l.description, ' ', '') ILIKE $${params.length} OR 
            REPLACE(l.specs::text, ' ', '') ILIKE $${params.length}
        )`;
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
    if (type && type !== 'All Types') {
        params.push(`%${type}%`);
        query += ` AND (
            l.specs->>'type' ILIKE $${params.length} OR 
            l.specs->>'sub_category' ILIKE $${params.length} OR 
            l.specs->>'part_category' ILIKE $${params.length} OR 
            l.specs->>'body_type' ILIKE $${params.length}
        )`;
    }
    if (breed && breed !== 'All Breeds') {
        params.push(`%${breed}%`);
        query += ` AND l.specs->>'breed' ILIKE $${params.length}`;
    }
    if (make && make !== 'All Makes') {
        params.push(`%${make}%`);
        // If it's spares, the make filter maps to the 'compatible' spec field or 'make'.
        query += ` AND (l.specs->>'make' ILIKE $${params.length} OR l.specs->>'compatible' ILIKE $${params.length})`;
    }
    if (model && model !== 'All Models') {
        params.push(`%${model}%`);
        query += ` AND l.specs->>'model' ILIKE $${params.length}`;
    }
    if (condition && condition !== 'Any') {
        params.push(condition);
        query += ` AND l.specs->>'condition' = $${params.length}`;
    }
    if (transmission && transmission !== 'Any') {
        params.push(transmission);
        query += ` AND l.specs->>'transmission' = $${params.length}`;
    }
    
    // ── SORTING & ROTATION ALGORITHM ──────────────────────────
    if (shuffle === 'true') {
        query += ` ORDER BY l.is_featured DESC, RANDOM()`;
    } else {
        if (sort === 'low') {
            query += ` ORDER BY l.is_featured DESC, l.price ASC`;
        } else if (sort === 'high') {
            query += ` ORDER BY l.is_featured DESC, l.price DESC`;
        } else if (sort === 'pop') {
            query += ` ORDER BY l.is_featured DESC, l.views DESC NULLS LAST, l.created_at DESC`;
        } else {
            query += ` ORDER BY l.is_featured DESC, l.created_at DESC`;
        }
    }

    const limitVal = parseInt(limit, 10) || 20; // default 20 per page
    const pageVal = parseInt(page, 10) || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    // Fetch limit + 1 to know if there's a next page
    params.push(limitVal + 1);
    query += ` LIMIT $${params.length}`;

    params.push(offsetVal);
    query += ` OFFSET $${params.length}`;

    try {
        const result = await pool.query(query, params);
        
        let hasNextPage = false;
        let finalRows = result.rows;

        // If we got more rows than the requested limit, it means there is a next page
        if (finalRows.length > limitVal) {
            hasNextPage = true;
            finalRows.pop(); // Remove the extra row before sending to client
        }

        return res.status(200).json({
            count: finalRows.length,
            hasNextPage: hasNextPage,
            page: pageVal,
            listings: finalRows
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
                FROM (SELECT id, full_name, phone, province, is_verified, created_at, profile_picture
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