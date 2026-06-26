-- ============================================
-- ZIM AUTOAGRI DATABASE SCHEMA
-- ============================================

-- USERS TABLE
-- Stores every registered user on the platform
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  UNIQUE NOT NULL,
    phone         VARCHAR(20),
    password_hash VARCHAR(255)  NOT NULL,
    province      VARCHAR(50),
    is_verified   BOOLEAN       DEFAULT FALSE,
    created_at    TIMESTAMP     DEFAULT NOW()
);

-- LISTINGS TABLE
-- Stores every ad posted by sellers
-- user_id links each listing back to its owner
-- ON DELETE CASCADE means if a user is deleted,
-- ALL their listings are automatically deleted too
CREATE TABLE IF NOT EXISTS listings (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER       REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(50)   NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    price       NUMERIC(12,2) NOT NULL,
    currency    VARCHAR(10)   DEFAULT 'USD',
    condition   VARCHAR(20),
    description TEXT,
    province    VARCHAR(50),
    location    VARCHAR(100),
    image_url   VARCHAR(500),
    is_featured BOOLEAN       DEFAULT FALSE,
    is_active   BOOLEAN       DEFAULT TRUE,
    views       INTEGER       DEFAULT 0,
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- INDEXES for fast searching
-- These make queries much faster when filtering by category or user
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_user_id  ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_province  ON listings(province);