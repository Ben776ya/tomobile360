-- Migration to add video likes functionality
-- Run this in your Supabase SQL Editor

-- Step 1: Add likes column to videos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'videos' AND column_name = 'likes'
    ) THEN
        ALTER TABLE videos ADD COLUMN likes INTEGER DEFAULT 0;
        COMMENT ON COLUMN videos.likes IS 'Number of likes on the video';
    END IF;
END $$;

-- Step 2: Create video_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Step 3: Enable Row Level Security
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies for video_likes
-- Allow anyone to view video likes (for counting)
DROP POLICY IF EXISTS "Anyone can view video likes" ON video_likes;
CREATE POLICY "Anyone can view video likes" ON video_likes
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own likes
DROP POLICY IF EXISTS "Authenticated users can like videos" ON video_likes;
CREATE POLICY "Authenticated users can like videos" ON video_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes (unlike)
DROP POLICY IF EXISTS "Users can unlike videos" ON video_likes;
CREATE POLICY "Users can unlike videos" ON video_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_composite ON video_likes(video_id, user_id);

-- Step 6: Create index on videos.likes for sorting
CREATE INDEX IF NOT EXISTS idx_videos_likes ON videos(likes);

-- Step 7: Verify the migration
SELECT 'video_likes table created successfully' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_likes');

SELECT 'likes column added to videos table' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'likes');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Video likes migration completed successfully!';
    RAISE NOTICE 'The video like feature is now ready to use.';
END $$;
