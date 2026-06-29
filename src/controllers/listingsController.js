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
        const user_id = req.user.id;
        const {
            category, title, price,
            currency, description, province,
            location, condition, specs
        } = req.body;

        // 1. Validate the fields every listing must have
        if (!category || !title || !price) {
            return res.status(400).json({
                error: 'category, title, and price are required.'
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
                 description, province, location, condition, images, specs, is_featured)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             RETURNING *`,
            [
                user_id, category, title, price,
                currency || 'USD', description,
                province, location, condition || 'New',
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

// Simple in-memory cache to drastically speed up database reads (like Redis, but built-in)
const cache = new Map();
const CACHE_DURATION_MS = 60000; // Cache results for 60 seconds

// ─────────────────────────────────────────────────────────
// GET /api/listings  — Browse, Search, Filter, Sort, Paginate
// ─────────────────────────────────────────────────────────
export const getAllListings = async (req, res) => {
    // We must ignore the 'seed' parameter for caching, otherwise every request generates a unique cache key and misses!
    const queryForCache = { ...req.query };
    delete queryForCache.seed;
    
    // Generate a unique cache key based on the exact query parameters
    const cacheKey = JSON.stringify(queryForCache);

    // Bypass cache completely for personal dashboard requests (when user_id is present) 
    // so users instantly see their newly created or edited listings.
    const isPersonalDashboard = !!req.query.user_id;

    // Check if we have a fresh cached response for this exact query
    if (!isPersonalDashboard && cache.has(cacheKey)) {
        const cachedEntry = cache.get(cacheKey);
        if (Date.now() < cachedEntry.expiry) {
            return res.status(200).json(cachedEntry.data);
        } else {
            cache.delete(cacheKey); // Clean up expired entry
        }
    }

    const {
        category, province, search, limit, user_id, shuffle,
        price_min, price_max, make, model, condition, transmission, type, breed, sort, page, exclude_id, featured, random_sample
    } = req.query;

    // We use a powerful window function to get total records and total views instantly without a second query
    let query = `
        SELECT l.*, 
               u.full_name as seller_name, u.phone as seller_phone, u.province as seller_province,
               COUNT(l.id) OVER() as full_count,
               SUM(l.views) OVER() as total_views
        FROM listings l
        JOIN users u ON l.user_id = u.id
        WHERE l.is_active = TRUE
    `;
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
        // Advanced Fuzzy Search:
        // 1. Split search into individual words
        // 2. Build a query that matches if ANY of the words loosely match the title/description
        const words = search.trim().split(/\s+/).filter(w => w.length > 0);
        
        if (words.length > 0) {
            const searchConditions = [];
            
            words.forEach(word => {
                // Exact ILIKE match
                const exactParam = `%${word}%`;
                params.push(exactParam);
                let condition = `(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`;
                
                // If word is > 3 letters, also do a fuzzy prefix match and a SOUNDEX phonetic match!
                // Soundex perfectly matches "benzi", "banzi", "bensi", and "benz" to the exact same phonetic code (B520)
                if (word.length > 3) {
                    const prefixParam = `%${word.substring(0, word.length - 1)}%`;
                    params.push(prefixParam);
                    condition += ` OR (l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`;
                    
                    // Ultra-Fuzzy: Strip vowels and put wildcards between consonants (e.g. 'benzi' -> '%b%n%z%')
                    // This perfectly handles 'benzi', 'banzi', 'bonzi' matching 'Benz'
                    const consonants = word.replace(/[aeiouAEIOU]/g, '').split('').join('%');
                    if (consonants.length >= 2) {
                        params.push(`%${consonants}%`);
                        condition += ` OR l.title ILIKE $${params.length}`;
                    }
                }
                
                searchConditions.push(`(${condition})`);
            });
            
            // Combine with OR so if they type "Toyota Banzi", "Toyota" matches even if "Banzi" fails
            query += ` AND (${searchConditions.join(' OR ')})`;
        }
    }
    if (user_id) {
        params.push(user_id);
        query += ` AND l.user_id = $${params.length}`;
    }
    if (req.query.featured === 'true') {
        query += ` AND l.is_featured = TRUE`;
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
    
    // ── SORTING ALGORITHM ──
    // The previous MD5 and RANDOM() approaches caused severe database performance bottlenecks (full table scans + heavy CPU load).
    // We now use highly optimized indexed sorting exclusively, and handle any necessary shuffling instantly in Node.js RAM.
    if (random_sample === 'true') {
        const seedVal = parseInt(req.query.seed, 10) || 123;
        // Fast deterministic pseudo-random sort using the seed so pagination works perfectly
        // We cast l.id to bigint to prevent integer overflow with large JS seeds
        query += ` ORDER BY l.is_featured DESC, ((l.id::bigint * ${seedVal}) % 10000)`;
    } else if (sort === 'low') {
        query += ` ORDER BY l.price ASC, l.is_featured DESC, l.created_at DESC`;
    } else if (sort === 'high') {
        query += ` ORDER BY l.price DESC, l.is_featured DESC, l.created_at DESC`;
    } else if (sort === 'pop') {
        // Sort by views
        query += ` ORDER BY l.views DESC, l.is_featured DESC, l.created_at DESC`;
    } else {
        // Default "Freshness" Sort.
        // Featured items are pinned to the top, then ordered by newest. 
        // This is lightning fast as it can utilize database indexes.
        query += ` ORDER BY l.is_featured DESC, l.created_at DESC`;
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

        // Extremely fast in-memory shuffling (zero database cost)
        if (shuffle === 'true') {
            for (let i = finalRows.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalRows[i], finalRows[j]] = [finalRows[j], finalRows[i]];
            }
        }

        // Extract total stats from the first row (if any exist)
        const totalCount = finalRows.length > 0 ? parseInt(finalRows[0].full_count, 10) : 0;
        const totalViews = finalRows.length > 0 ? parseInt(finalRows[0].total_views, 10) : 0;

        // Clean up the window function columns so they don't pollute the listing objects
        finalRows = finalRows.map(row => {
            const { full_count, total_views, ...cleanRow } = row;
            return cleanRow;
        });

        const responseData = {
            count: totalCount,
            totalViews: totalViews,
            hasNextPage: hasNextPage,
            page: pageVal,
            listings: finalRows
        };

        // Save to cache for 60 seconds
        cache.set(cacheKey, { data: responseData, expiry: Date.now() + CACHE_DURATION_MS });

        return res.status(200).json(responseData);
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

import jwt from 'jsonwebtoken';

// In-memory cache to track views and prevent spam (wipes on server restart, which is fine)
// Format: "listingId_userIdOrIP" => timestamp
const viewTracker = new Map();
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─────────────────────────────────────────────────────────
// POST /api/listings/:id/view  — Increment view count
// ─────────────────────────────────────────────────────────
export const incrementListingViews = async (req, res) => {
    const { id } = req.params;
    let userId = null;

    // 1. Identify user (either logged in user, or anonymous IP)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (err) {
            // Invalid token, ignore and treat as anonymous
        }
    }

    const viewerIdentifier = userId ? `user_${userId}` : `ip_${req.ip}`;
    const trackKey = `${id}_${viewerIdentifier}`;

    try {
        // 2. Check if the viewer is the owner of the listing
        const listingCheck = await pool.query('SELECT user_id FROM listings WHERE id = $1 AND is_active = TRUE', [id]);
        
        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }

        const ownerId = listingCheck.rows[0].user_id;

        // If logged-in user is the owner, do not increment views
        if (userId && String(ownerId) === String(userId)) {
            return res.status(200).json({ message: 'Owner view ignored.' });
        }

        // 3. Rate limit check (Once per 24 hours per user/IP per listing)
        if (viewTracker.has(trackKey)) {
            const lastViewedAt = viewTracker.get(trackKey);
            if (Date.now() - lastViewedAt < VIEW_COOLDOWN_MS) {
                return res.status(200).json({ message: 'Already viewed recently.' });
            }
        }

        // 4. Update the 7-day rolling view count
        const historyCheck = await pool.query('SELECT view_history FROM listings WHERE id = $1', [id]);
        let history = historyCheck.rows[0].view_history || {};
        
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        let totalViews = 0;
        
        // Clean out dates older than 7 days and sum the rest
        for (const date in history) {
            if (new Date(date) < sevenDaysAgo) {
                delete history[date];
            } else {
                totalViews += history[date];
            }
        }
        
        // Add today's view
        history[today] = (history[today] || 0) + 1;
        totalViews += 1;

        const result = await pool.query(
            `UPDATE listings SET views = $1, view_history = $2
             WHERE id = $3 AND is_active = TRUE
             RETURNING views`,
            [totalViews, history, id]
        );

        // 5. Update the tracker cache
        viewTracker.set(trackKey, Date.now());

        // Periodically clean up old tracker entries (rudimentary garbage collection)
        if (viewTracker.size > 10000) {
            const now = Date.now();
            for (const [key, timestamp] of viewTracker.entries()) {
                if (now - timestamp > VIEW_COOLDOWN_MS) {
                    viewTracker.delete(key);
                }
            }
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

// ─────────────────────────────────────────────────────────
// PUT /api/listings/:id  — Update a listing
// ─────────────────────────────────────────────────────────
export const updateListing = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    const {
        title, price, currency, description, province, location, condition, specs, existing_images, images_updated
    } = req.body;

    try {
        // 1. Verify ownership
        const check = await pool.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, user_id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found or unauthorized.' });
        }
        
        let currentImages = check.rows[0].images || [];

        // Parse specs
        let parsedSpecs = check.rows[0].specs;
        if (specs) {
            try {
                parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
            } catch (e) {}
        }

        // Image Management: Support Appending and Deleting
        if (images_updated === 'true') {
            currentImages = [];
            if (existing_images) {
                currentImages = Array.isArray(existing_images) ? [...existing_images] : [existing_images];
            }
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const webpBuffer = await sharp(file.buffer)
                        .resize({ width: 1200, withoutEnlargement: true })
                        .webp({ quality: 60 })
                        .toBuffer();
                    const base64Image = `data:image/webp;base64,${webpBuffer.toString('base64')}`;
                    currentImages.push(base64Image);
                }
            }
        }

        // Enforce Max 3 Images
        if (currentImages.length > 3) {
            return res.status(400).json({ error: 'Maximum of 3 images allowed per listing.' });
        }

        // Update listing
        const result = await pool.query(
            `UPDATE listings
             SET title = COALESCE($1, title),
                 price = COALESCE($2::numeric, price),
                 currency = COALESCE($3, currency),
                 description = COALESCE($4, description),
                 province = COALESCE($5, province),
                 location = COALESCE($6, location),
                 condition = COALESCE($7, condition),
                 specs = $8::jsonb,
                 images = $9::text[]
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            [title, price, currency, description, province, location, condition, parsedSpecs, currentImages, id, user_id]
        );

        return res.status(200).json({
            message: '✅ Listing updated successfully!',
            listing: result.rows[0]
        });

    } catch (err) {
        console.error('Update listing error:', err.message);
        return res.status(500).json({ error: `Server error: ${err.message}` });
    }
};