-- Atomic view counter functions for articles, forum topics, and videos
-- Matches existing pattern: increment_vehicle_views and increment_used_vehicle_views

CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_forum_topic_views(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_topics
  SET views = views + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UNIQUE constraint on videos.video_url required for PERF-03 batch upsert (onConflict)
-- Existing index idx_videos_video_url is NOT a unique constraint
ALTER TABLE videos ADD CONSTRAINT videos_video_url_key UNIQUE (video_url);
