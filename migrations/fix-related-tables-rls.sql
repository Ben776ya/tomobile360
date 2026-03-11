-- Fix RLS policies for related tables (brands, models, profiles)
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. FIX BRANDS TABLE RLS
-- ==========================================

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read brands" ON brands;
DROP POLICY IF EXISTS "Enable read access for all users" ON brands;

-- Allow public read access to brands
CREATE POLICY "Public read brands" ON brands
    FOR SELECT
    USING (true);

-- ==========================================
-- 2. FIX MODELS TABLE RLS
-- ==========================================

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read models" ON models;
DROP POLICY IF EXISTS "Enable read access for all users" ON models;

-- Allow public read access to models
CREATE POLICY "Public read models" ON models
    FOR SELECT
    USING (true);

-- ==========================================
-- 3. FIX PROFILES TABLE RLS
-- ==========================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "User insert own profile" ON profiles;
DROP POLICY IF EXISTS "User update own profile" ON profiles;

-- Allow public read access to profiles (for displaying seller info)
CREATE POLICY "Public read profiles" ON profiles
    FOR SELECT
    USING (true);

-- Allow users to insert their own profile
CREATE POLICY "User insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "User update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==========================================
-- 4. FIX FORUM TABLES RLS (if they exist)
-- ==========================================

-- Forum categories - public read
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read forum_categories" ON forum_categories;
CREATE POLICY "Public read forum_categories" ON forum_categories
    FOR SELECT
    USING (true);

-- Forum topics - public read
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read forum_topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated insert forum_topics" ON forum_topics;
DROP POLICY IF EXISTS "Author update forum_topics" ON forum_topics;
DROP POLICY IF EXISTS "Author delete forum_topics" ON forum_topics;

CREATE POLICY "Public read forum_topics" ON forum_topics
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated insert forum_topics" ON forum_topics
    FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author update forum_topics" ON forum_topics
    FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author delete forum_topics" ON forum_topics
    FOR DELETE
    USING (auth.uid() = author_id);

-- Forum posts - public read
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read forum_posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated insert forum_posts" ON forum_posts;
DROP POLICY IF EXISTS "Author update forum_posts" ON forum_posts;
DROP POLICY IF EXISTS "Author delete forum_posts" ON forum_posts;

CREATE POLICY "Public read forum_posts" ON forum_posts
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated insert forum_posts" ON forum_posts
    FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author update forum_posts" ON forum_posts
    FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author delete forum_posts" ON forum_posts
    FOR DELETE
    USING (auth.uid() = author_id);

-- ==========================================
-- 5. FIX ARTICLES TABLE RLS (if exists)
-- ==========================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read articles" ON articles;
CREATE POLICY "Public read articles" ON articles
    FOR SELECT
    USING (true);

-- ==========================================
-- 6. FIX VIDEOS TABLE RLS (if exists)
-- ==========================================

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read videos" ON videos;
CREATE POLICY "Public read videos" ON videos
    FOR SELECT
    USING (true);

-- ==========================================
-- 7. FIX PROMOTIONS TABLE RLS (if exists)
-- ==========================================

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read promotions" ON promotions;
CREATE POLICY "Public read promotions" ON promotions
    FOR SELECT
    USING (true);

-- ==========================================
-- 8. VERIFY ALL POLICIES
-- ==========================================

-- Check all table policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
    'brands', 'models', 'profiles',
    'vehicles_used', 'vehicles_new', 'favorites',
    'forum_categories', 'forum_topics', 'forum_posts',
    'articles', 'videos', 'promotions'
)
ORDER BY tablename, policyname;

-- ==========================================
-- 9. TEST QUERIES
-- ==========================================

-- Test vehicles_used with joins (this is what the detail page does)
SELECT
    vu.*,
    b.name as brand_name,
    m.name as model_name,
    p.full_name as seller_name
FROM vehicles_used vu
LEFT JOIN brands b ON b.id = vu.brand_id
LEFT JOIN models m ON m.id = vu.model_id
LEFT JOIN profiles p ON p.id = vu.user_id
WHERE vu.is_active = true
ORDER BY vu.created_at DESC
LIMIT 3;
