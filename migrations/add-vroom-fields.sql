-- Migration: Add new fields for vroom.be scraped data
-- Run this SQL in your Supabase SQL Editor

-- Add new columns to vehicles_new table
ALTER TABLE vehicles_new
ADD COLUMN IF NOT EXISTS doors INTEGER,
ADD COLUMN IF NOT EXISTS warranty_months INTEGER,
ADD COLUMN IF NOT EXISTS exterior_color TEXT,
ADD COLUMN IF NOT EXISTS interior_color TEXT,
ADD COLUMN IF NOT EXISTS euro_norm TEXT,
ADD COLUMN IF NOT EXISTS vat_deductible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS power_kw INTEGER,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;

-- Add index for filtering by doors (common filter)
CREATE INDEX IF NOT EXISTS idx_vehicles_new_doors ON vehicles_new(doors);

-- Add index for filtering by exterior color
CREATE INDEX IF NOT EXISTS idx_vehicles_new_exterior_color ON vehicles_new(exterior_color);

-- Done! The vehicles_new table now supports all vroom.be scraped fields.
