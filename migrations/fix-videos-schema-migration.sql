-- Migration to fix videos table schema for YouTube sync
-- Run this in your Supabase SQL Editor BEFORE running the sync

-- Step 1: Add is_published column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE videos ADD COLUMN is_published BOOLEAN DEFAULT true;
        COMMENT ON COLUMN videos.is_published IS 'Whether the video is published and visible';
    END IF;
END $$;

-- Step 2: Add video_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'video_url'
    ) THEN
        -- Add the new column
        ALTER TABLE videos ADD COLUMN video_url TEXT;

        -- Copy data from embed_url to video_url if embed_url exists
        UPDATE videos SET video_url = embed_url WHERE embed_url IS NOT NULL;

        -- Make video_url required
        ALTER TABLE videos ALTER COLUMN video_url SET NOT NULL;

        COMMENT ON COLUMN videos.video_url IS 'Full YouTube video URL';
    END IF;
END $$;

-- Step 3: Drop embed_url column if video_url exists (optional - uncomment if you want to remove embed_url)
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns
--         WHERE table_name = 'videos' AND column_name = 'embed_url'
--     ) THEN
--         ALTER TABLE videos DROP COLUMN embed_url;
--     END IF;
-- END $$;

-- Step 4: Update category constraint to support lowercase values
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_category_check;
ALTER TABLE videos ADD CONSTRAINT videos_category_check
    CHECK (category IN ('review', 'comparison', 'news', 'guide', 'event', 'Review', 'Launch', 'Comparison', 'Tutorial', 'News'));

-- Step 5: Create index on video_url for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON videos(video_url);

-- Step 6: Create index on is_published for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published) WHERE is_published = true;

-- Step 7: Verify the schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Videos table schema migration completed successfully!';
    RAISE NOTICE 'You can now run the YouTube sync from the admin page.';
END $$;
