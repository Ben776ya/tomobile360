// YouTube Data API Integration
// Utility functions to fetch and parse YouTube channel videos

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  duration: string
  viewCount: number
  videoUrl: string
}

/**
 * Extracts channel ID from YouTube channel URL
 */
export function extractChannelId(url: string): string | null {
  // Handle different YouTube channel URL formats
  const patterns = [
    /youtube\.com\/channel\/(UC[\w-]+)/,
    /youtube\.com\/c\/([\w-]+)/,
    /youtube\.com\/@([\w-]+)/,
    /youtube\.com\/user\/([\w-]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Converts ISO 8601 duration to readable format (MM:SS or HH:MM:SS)
 */
export function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Fetches videos from a YouTube channel using YouTube Data API v3
 */
export async function fetchYouTubeChannelVideos(
  channelHandle: string,
  apiKey: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  try {
    // Step 1: Get channel ID from handle/username
    let channelId = channelHandle

    // If it's a handle (starts with @) or custom URL, we need to search for the channel
    if (channelHandle.startsWith('@') || !channelHandle.startsWith('UC')) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelHandle)}&key=${apiKey}`
      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()

      if (!searchResponse.ok) {
        throw new Error(`YouTube API Error: ${searchData.error?.message || 'Unknown error'}`)
      }

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('Channel not found')
      }

      channelId = searchData.items[0].id.channelId
    }

    // Step 2: Get uploads playlist ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (!channelResponse.ok) {
      throw new Error(`YouTube API Error: ${channelData.error?.message || 'Unknown error'}`)
    }

    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist')
    }

    // Step 3: Get videos from uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
    const playlistResponse = await fetch(playlistUrl)
    const playlistData = await playlistResponse.json()

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API Error: ${playlistData.error?.message || 'Unknown error'}`)
    }

    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',')

    // Step 4: Get detailed video information (duration, views, etc.)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    if (!videosResponse.ok) {
      throw new Error(`YouTube API Error: ${videosData.error?.message || 'Unknown error'}`)
    }

    // Step 5: Parse and return video data
    const videos: YouTubeVideo[] = videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.maxresdefault?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
      publishedAt: video.snippet.publishedAt,
      duration: parseDuration(video.contentDetails.duration),
      viewCount: parseInt(video.statistics.viewCount || '0'),
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    }))

    return videos
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Categorizes a video based on its title and description
 */
export function categorizeVideo(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  if (text.includes('essai') || text.includes('test') || text.includes('review')) {
    return 'review'
  }
  if (text.includes('comparatif') || text.includes('vs') || text.includes('comparison')) {
    return 'comparison'
  }
  if (text.includes('guide') || text.includes('conseil') || text.includes('tutorial')) {
    return 'guide'
  }
  if (text.includes('salon') || text.includes('event') || text.includes('événement')) {
    return 'event'
  }
  if (text.includes('actualité') || text.includes('news') || text.includes('nouveau')) {
    return 'news'
  }

  // Default to news if no category matched
  return 'news'
}
