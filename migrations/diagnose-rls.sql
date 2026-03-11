-- Diagnostic queries to check RLS policies on vehicles_used table
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if RLS is enabled on vehicles_used
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'vehicles_used';

-- 2. Check existing policies on vehicles_used
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'vehicles_used';

-- 3. Check recent vehicles_used entries
SELECT id, user_id, is_active, is_sold, created_at, brand_id, model_id
FROM vehicles_used
ORDER BY created_at DESC
LIMIT 5;

-- 4. Count total vehicles_used entries
SELECT COUNT(*) as total_listings FROM vehicles_used;

-- 5. Count active listings
SELECT COUNT(*) as active_listings FROM vehicles_used WHERE is_active = true AND is_sold = false;
