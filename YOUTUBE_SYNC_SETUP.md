# YouTube Sync Setup Guide

This guide explains how to set up automatic video synchronization from your Tomobile360 YouTube channel.

## Overview

The YouTube sync feature automatically fetches videos from your YouTube channel with:
- ✅ Real titles and descriptions from YouTube
- ✅ Correct view counts
- ✅ Actual video thumbnails
- ✅ Accurate video durations
- ✅ Automatic categorization based on content
- ✅ Publish dates from YouTube

## Setup Steps

### Step 1: Get YouTube Data API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API key"
   - Copy the generated API key

5. **Restrict the API Key (Optional but Recommended)**
   - Click on the created API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Check only "YouTube Data API v3"
   - Under "Application restrictions", you can restrict by IP or HTTP referrer
   - Click "Save"

### Step 2: Configure Environment Variable

1. Open your `.env.local` file in the project root

2. Add your YouTube API key:
   ```env
   YOUTUBE_API_KEY=YOUR_API_KEY_HERE
   ```

3. Save the file

### Step 3: Restart Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

### Step 4: Sync Videos

1. **Navigate to the Admin Sync Page**
   - Go to: http://localhost:3003/admin/sync-videos

2. **Click "Synchroniser maintenant"**
   - The system will fetch all videos from your Tomobile360 YouTube channel
   - It will import them with correct metadata
   - Existing videos will be updated with current view counts

3. **Check Results**
   - After sync completes, visit: http://localhost:3003/videos
   - You should see all your YouTube videos with real data

## How It Works

### Video Fetching Process

1. **Connect to YouTube API** - Uses your API key to authenticate
2. **Find Channel** - Searches for "Tomobile360" channel
3. **Get Uploads Playlist** - Retrieves the channel's uploads playlist ID
4. **Fetch Video List** - Gets up to 50 most recent videos
5. **Get Detailed Info** - Fetches full metadata (duration, views, etc.)
6. **Parse & Store** - Converts data and saves to your database

### Automatic Categorization

Videos are automatically categorized based on title and description keywords:

| Category | Keywords |
|----------|----------|
| **review** (Essai) | essai, test, review |
| **comparison** (Comparatif) | comparatif, vs, comparison |
| **guide** (Guide) | guide, conseil, tutorial |
| **event** (Événement) | salon, event, événement |
| **news** (Actualité) | actualité, news, nouveau |

### Data Synced

For each video, the system syncs:
- **Title** - Original YouTube title
- **Description** - Full YouTube description
- **Thumbnail** - High-resolution thumbnail (maxresdefault)
- **Duration** - Formatted as MM:SS or HH:MM:SS
- **Views** - Current view count from YouTube
- **Published Date** - Original upload date
- **Video URL** - Full YouTube watch URL
- **Category** - Auto-detected based on content

## Automation Options

### Option 1: Manual Sync
- Visit `/admin/sync-videos` and click the sync button whenever you want to update

### Option 2: Vercel Cron (Recommended for Production)

Create a cron job endpoint:

```typescript
// src/app/api/cron/sync-videos/route.ts
import { NextResponse } from 'next/server'
import { syncYouTubeVideos } from '@/app/actions/sync-youtube'

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncYouTubeVideos()
  return NextResponse.json(result)
}
```

Then configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-videos",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This will sync videos every 6 hours automatically.

### Option 3: External Cron Service

Use services like:
- **Cron-job.org** - Free cron job service
- **EasyCron** - Scheduled tasks service
- **GitHub Actions** - Automated workflows

Configure them to call your sync endpoint regularly.

## API Quota Limits

YouTube Data API v3 has quota limits:
- **Default quota**: 10,000 units per day
- **Sync operation cost**: ~100-200 units per sync
- **You can sync**: ~50-100 times per day

For higher limits, request a quota increase from Google Cloud Console.

## Troubleshooting

### "YouTube API key not configured"
- Make sure you added `YOUTUBE_API_KEY` to `.env.local`
- Restart your development server after adding the key

### "Channel not found"
- Verify the channel handle is correct in `src/app/actions/sync-youtube.ts`
- The current configuration uses "Tomobile360"

### "API quota exceeded"
- You've hit the daily quota limit
- Wait until the next day (resets at midnight Pacific Time)
- Or request a quota increase from Google Cloud Console

### "Invalid API key"
- Check that you copied the complete API key
- Verify the API key has YouTube Data API v3 enabled
- Make sure there are no extra spaces in the `.env.local` file

### Videos not appearing
- Check that videos are marked as `is_published: true`
- Verify video URLs in database match YouTube format
- Check browser console for any errors

## Database Schema

The videos table structure:

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  category TEXT,
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  vehicle_id UUID -- optional link to vehicle
);
```

## Benefits

✅ **Always Up-to-Date** - View counts and metadata stay current
✅ **No Manual Entry** - Saves time vs. manually adding videos
✅ **Accurate Data** - Uses official YouTube metadata
✅ **Auto-Categorization** - Intelligently sorts videos
✅ **Thumbnail Quality** - High-resolution thumbnails from YouTube

## Next Steps

1. Get your YouTube API key from Google Cloud Console
2. Add it to `.env.local`
3. Restart your server
4. Visit `/admin/sync-videos` and click sync
5. Enjoy automatic video synchronization! 🎉

For questions or issues, check the troubleshooting section or review the code in:
- `src/lib/youtube.ts` - YouTube API utilities
- `src/app/actions/sync-youtube.ts` - Sync server action
- `src/app/admin/sync-videos/page.tsx` - Admin interface
