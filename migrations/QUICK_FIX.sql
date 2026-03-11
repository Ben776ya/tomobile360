-- QUICK FIX: Add missing columns to videos table
-- Copy and paste this entire script into Supabase SQL Editor and click RUN

-- Add is_published column
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add video_url column
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Copy existing embed_url data to video_url
UPDATE videos SET video_url = embed_url WHERE video_url IS NULL AND embed_url IS NOT NULL;

-- Make video_url NOT NULL (after copying data)
ALTER TABLE videos ALTER COLUMN video_url SET DEFAULT '';

-- Update category constraint to support lowercase
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_category_check;
ALTER TABLE videos ADD CONSTRAINT videos_category_check
    CHECK (category IN ('review', 'comparison', 'news', 'guide', 'event', 'Review', 'Launch', 'Comparison', 'Tutorial', 'News'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON videos(video_url);
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published);

-- Show current schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;
