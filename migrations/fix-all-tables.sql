-- Comprehensive fix for all database issues
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. FIX FAVORITES TABLE
-- ==========================================

-- Drop the table if it exists to recreate with correct schema
DROP TABLE IF EXISTS favorites CASCADE;

-- Create favorites table with correct columns
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_new_id UUID REFERENCES vehicles_new(id) ON DELETE CASCADE,
    vehicle_used_id UUID REFERENCES vehicles_used(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('new', 'used')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT favorites_vehicle_check CHECK (
        (vehicle_type = 'new' AND vehicle_new_id IS NOT NULL AND vehicle_used_id IS NULL) OR
        (vehicle_type = 'used' AND vehicle_used_id IS NOT NULL AND vehicle_new_id IS NULL)
    ),
    CONSTRAINT favorites_unique UNIQUE (user_id, vehicle_new_id, vehicle_used_id)
);

-- Create indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_vehicle_new_id ON favorites(vehicle_new_id);
CREATE INDEX idx_favorites_vehicle_used_id ON favorites(vehicle_used_id);

-- Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- 2. FIX VEHICLES_USED RLS POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles_used;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles_used;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON vehicles_used;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON vehicles_used;
DROP POLICY IF EXISTS "Public read access" ON vehicles_used;
DROP POLICY IF EXISTS "Authenticated insert" ON vehicles_used;
DROP POLICY IF EXISTS "User update own" ON vehicles_used;
DROP POLICY IF EXISTS "User delete own" ON vehicles_used;

-- Enable RLS
ALTER TABLE vehicles_used ENABLE ROW LEVEL SECURITY;

-- Create new policies for vehicles_used
CREATE POLICY "Public read access" ON vehicles_used
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated insert" ON vehicles_used
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User update own" ON vehicles_used
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User delete own" ON vehicles_used
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- 3. FIX VEHICLES_NEW RLS POLICIES (if needed)
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public read vehicles_new" ON vehicles_new;
DROP POLICY IF EXISTS "Admin insert vehicles_new" ON vehicles_new;
DROP POLICY IF EXISTS "Admin update vehicles_new" ON vehicles_new;
DROP POLICY IF EXISTS "Admin delete vehicles_new" ON vehicles_new;

-- Enable RLS
ALTER TABLE vehicles_new ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles_new (public read, admin write)
CREATE POLICY "Public read vehicles_new" ON vehicles_new
    FOR SELECT
    USING (true);

CREATE POLICY "Admin insert vehicles_new" ON vehicles_new
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admin update vehicles_new" ON vehicles_new
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admin delete vehicles_new" ON vehicles_new
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ==========================================
-- 4. VERIFY ALL POLICIES
-- ==========================================

-- Check vehicles_used policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'vehicles_used';

-- Check favorites policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'favorites';

-- Check vehicles_new policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'vehicles_new';

-- ==========================================
-- 5. TEST DATA VISIBILITY
-- ==========================================

-- Count vehicles_used (should work even without auth)
SELECT COUNT(*) as total_used_listings FROM vehicles_used;

-- Count active vehicles_used
SELECT COUNT(*) as active_listings FROM vehicles_used WHERE is_active = true AND is_sold = false;

-- Show recent vehicles_used
SELECT id, user_id, is_active, is_sold, brand_id, model_id, created_at
FROM vehicles_used
ORDER BY created_at DESC
LIMIT 5;
