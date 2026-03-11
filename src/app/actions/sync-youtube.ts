'use server'

import { createClient as createServerClient } from '@supabase/supabase-js'
import { fetchYouTubeChannelVideos, categorizeVideo } from '@/lib/youtube'

export interface SyncResult {
  success: boolean
  message: string
  videosAdded?: number
  videosUpdated?: number
  error?: string
}

/**
 * Syncs videos from YouTube channel to the database
 * This server action fetches all videos from the channel and updates the database
 */
export async function syncYouTubeVideos(): Promise<SyncResult> {
  try {
    console.log('Starting YouTube sync...')

    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      console.error('YouTube API key not found in environment')
      return {
        success: false,
        message: 'YouTube API key not configured',
        error: 'YOUTUBE_API_KEY environment variable is missing. Please add it to your .env.local file.',
      }
    }

    console.log('API key found, fetching videos from YouTube...')

    // Fetch videos from YouTube channel
    const channelHandle = 'Tomobile360' // or use environment variable
    const youtubeVideos = await fetchYouTubeChannelVideos(channelHandle, apiKey, 50)

    console.log(`Fetched ${youtubeVideos.length} videos from YouTube`)

    if (youtubeVideos.length === 0) {
      return {
        success: true,
        message: 'No videos found on the channel',
        videosAdded: 0,
        videosUpdated: 0,
      }
    }

    // Connect to Supabase with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return {
        success: false,
        message: 'Supabase not configured',
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      }
    }

    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let videosAdded = 0
    let videosUpdated = 0

    // Process each video
    for (const video of youtubeVideos) {
      // Check if video already exists in database
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id, views')
        .eq('video_url', video.videoUrl)
        .single()

      const videoData = {
        title: video.title,
        description: video.description,
        video_url: video.videoUrl,
        thumbnail_url: video.thumbnailUrl,
        duration: video.duration,
        category: categorizeVideo(video.title, video.description),
        views: video.viewCount,
        is_published: true,
        created_at: new Date(video.publishedAt).toISOString(),
      }

      if (existingVideo) {
        // Update existing video (mainly views count)
        const { error } = await supabase
          .from('videos')
          .update({
            views: video.viewCount,
            thumbnail_url: video.thumbnailUrl,
            description: video.description,
            title: video.title,
            duration: video.duration,
          })
          .eq('id', existingVideo.id)

        if (!error) {
          videosUpdated++
        } else {
          console.error(`Error updating video ${video.title}:`, error)
        }
      } else {
        // Insert new video
        const { error } = await supabase
          .from('videos')
          .insert([videoData])

        if (!error) {
          videosAdded++
        } else {
          console.error(`Error inserting video ${video.title}:`, error)
        }
      }
    }

    return {
      success: true,
      message: `Sync completed: ${videosAdded} videos added, ${videosUpdated} videos updated`,
      videosAdded,
      videosUpdated,
    }
  } catch (error) {
    console.error('Error syncing YouTube videos:', error)
    return {
      success: false,
      message: 'Failed to sync videos',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets the last sync status and stats
 */
export async function getVideoStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      totalVideos: 0,
      totalViews: 0,
      lastVideo: null,
    }
  }

  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data: videos, count } = await supabase
    .from('videos')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const totalViews = videos?.reduce((sum: number, video: any) => sum + (video.views || 0), 0) || 0

  return {
    totalVideos: count || 0,
    totalViews,
    lastVideo: videos?.[0],
  }
}
