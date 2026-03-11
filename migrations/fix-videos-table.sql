-- Fix videos table schema to match application code
-- Run this BEFORE running add-youtube-videos.sql

-- Check if the table exists and what columns it has
-- (Just for reference - comment these out when running the full script)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'videos'
-- ORDER BY ordinal_position;

-- Add missing columns if they don't exist
-- Add is_published column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE videos ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Rename embed_url to video_url if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'embed_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE videos RENAME COLUMN embed_url TO video_url;
    END IF;
END $$;

-- Add video_url column if it doesn't exist at all
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE videos ADD COLUMN video_url TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Update category constraint to match French categories used in the app
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_category_check;
ALTER TABLE videos ADD CONSTRAINT videos_category_check
    CHECK (category IN ('review', 'comparison', 'news', 'guide', 'event', 'Review', 'Launch', 'Comparison', 'Tutorial', 'News'));

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;
