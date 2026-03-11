-- Fix Row Level Security Policies for vehicles_used table
-- Run this in Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles_used;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles_used;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON vehicles_used;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON vehicles_used;

-- Enable RLS if not already enabled
ALTER TABLE vehicles_used ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- 1. Allow anyone to read active listings (public read)
CREATE POLICY "Enable read access for all users" ON vehicles_used
    FOR SELECT
    USING (true);

-- 2. Allow authenticated users to insert their own listings
CREATE POLICY "Enable insert for authenticated users only" ON vehicles_used
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own listings
CREATE POLICY "Enable update for users based on user_id" ON vehicles_used
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own listings
CREATE POLICY "Enable delete for users based on user_id" ON vehicles_used
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'vehicles_used';
