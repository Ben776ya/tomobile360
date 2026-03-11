-- Fix RLS policies for related tables (brands, models, profiles)
-- Run this in Supabase SQL Editor
-- This version skips tables that might not exist or have different schemas

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
-- 4. VERIFY POLICIES
-- ==========================================

-- Check the important table policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('brands', 'models', 'profiles', 'vehicles_used', 'vehicles_new', 'favorites')
ORDER BY tablename, policyname;

-- ==========================================
-- 5. TEST QUERIES
-- ==========================================

-- Test vehicles_used with joins (this is what the detail page does)
SELECT
    vu.id,
    vu.user_id,
    vu.is_active,
    vu.is_sold,
    vu.created_at,
    b.name as brand_name,
    m.name as model_name,
    p.full_name as seller_name
FROM vehicles_used vu
LEFT JOIN brands b ON b.id = vu.brand_id
LEFT JOIN models m ON m.id = vu.model_id
LEFT JOIN profiles p ON p.id = vu.user_id
WHERE vu.is_active = true
ORDER BY vu.created_at DESC
LIMIT 5;

-- Count total vehicles_used
SELECT COUNT(*) as total_listings FROM vehicles_used;

-- Count active vehicles_used
SELECT COUNT(*) as active_listings FROM vehicles_used WHERE is_active = true AND is_sold = false;
