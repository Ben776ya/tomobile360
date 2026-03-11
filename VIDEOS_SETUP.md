# YouTube Videos Setup Guide

This guide explains how to add the 5 YouTube test videos to your Tomobile 360 database.

## Prerequisites

- Access to your Supabase project dashboard
- SQL Editor access in Supabase

## Setup Steps

### Step 1: Fix Videos Table Schema

The application code expects certain columns that may not exist in the original schema. Run this first to ensure compatibility.

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `fix-videos-table.sql`
4. Copy the contents and paste into the SQL Editor
5. Click **Run** to execute

This script will:
- Add `is_published` column if missing
- Rename `embed_url` to `video_url` if needed
- Update category constraints to support both English and French categories

### Step 2: Add YouTube Videos

After fixing the schema, insert the test videos:

1. In the Supabase SQL Editor
2. Open the file `add-youtube-videos.sql`
3. Copy the contents and paste into the SQL Editor
4. Click **Run** to execute

This will insert 5 YouTube videos:

| Title | Category | URL |
|-------|----------|-----|
| Essai Mercedes-Benz EQE SUV | Review (Essai) | https://www.youtube.com/watch?v=X75EEBBNqh4 |
| Nouveau Peugeot 3008 2024 | News (Actualité) | https://www.youtube.com/watch?v=RV7r7ch2dls |
| Comparatif SUV Hybrides | Comparison (Comparatif) | https://www.youtube.com/watch?v=yGPe1WGgCUk |
| Guide d'Achat Première Voiture | Guide | https://www.youtube.com/watch?v=HJG5aXwWugc |
| Salon de l'Auto 2024 | Event (Événement) | https://www.youtube.com/watch?v=mmtTQIJ2XLg |

### Step 3: Verify Installation

After running both scripts, verify the videos were added:

1. Navigate to http://localhost:3000/videos
2. You should see all 5 videos displayed
3. Click on any video to view the detail page with the embedded YouTube player

## Video Categories

The application supports these video categories:

- `review` - Essais (Vehicle reviews and tests)
- `comparison` - Comparatifs (Vehicle comparisons)
- `news` - Actualités (Automotive news)
- `guide` - Guides (Buying guides and tutorials)
- `event` - Événements (Auto shows and events)

## Thumbnail URLs

The videos use YouTube's automatic thumbnail generation:
- Format: `https://i.ytimg.com/vi/{VIDEO_ID}/maxresdefault.jpg`
- This provides high-quality thumbnails directly from YouTube

## Adding More Videos

To add more videos in the future, use this SQL template:

```sql
INSERT INTO videos (
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  category,
  is_published,
  views
) VALUES (
  'Your Video Title',
  'Your video description',
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg',
  'MM:SS',
  'review', -- or comparison, news, guide, event
  true,
  0
);
```

## Troubleshooting

### Videos Not Showing Up

- Check that `is_published` is set to `true`
- Verify RLS policies allow public read access to videos table
- Check browser console for any Supabase errors

### YouTube Embed Not Working

- Ensure the `video_url` column contains the full YouTube URL
- The application automatically extracts the video ID and creates the embed URL
- Both `youtube.com/watch?v=` and `youtu.be/` formats are supported

### Category Filter Not Working

- Verify the category value matches one of: 'review', 'comparison', 'news', 'guide', 'event'
- Categories are case-sensitive

## Next Steps

After adding these test videos, you can:

1. Test the video playback functionality
2. Test the category filtering on /videos page
3. Test the related videos feature on detail pages
4. Add more videos with real automotive content
5. Link videos to specific vehicles using the `vehicle_id` field
