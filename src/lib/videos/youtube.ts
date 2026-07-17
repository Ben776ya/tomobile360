/**
 * YouTube/Vimeo URL helpers shared by the video detail page and the lazy embed
 * component. Pure — no I/O.
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'other'

export function getVideoProvider(url: string): VideoProvider {
  if (!url) return 'other'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'other'
}

/** Extract the provider video id from a watch/share/embed URL. Null if unparseable. */
export function getVideoId(url: string): string | null {
  if (!url) return null
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split(/[?&]/)[0] || null
  }
  if (url.includes('youtube.com')) {
    try {
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v) return v
      const m = u.pathname.match(/\/(?:embed|shorts)\/([^/?&]+)/)
      if (m) return m[1]
    } catch {
      // Not an absolute URL — fall through to null.
    }
    return null
  }
  if (url.includes('vimeo.com')) {
    return url.split('vimeo.com/')[1]?.split(/[?&]/)[0] || null
  }
  return null
}

/** Build an embeddable iframe URL. Returns the original url if unrecognised. */
export function getVideoEmbedUrl(url: string): string {
  const provider = getVideoProvider(url)
  const id = getVideoId(url)
  if (provider === 'youtube' && id) return `https://www.youtube.com/embed/${id}`
  if (provider === 'vimeo' && id) return `https://player.vimeo.com/video/${id}`
  return url
}

/** A YouTube thumbnail URL (hqdefault) derived from a watch/share URL. Null if not YouTube. */
export function getYouTubeThumbnail(url: string): string | null {
  if (getVideoProvider(url) !== 'youtube') return null
  const id = getVideoId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

/** Convert "MM:SS" or "H:MM:SS" to an ISO 8601 duration (PT#H#M#S). undefined if invalid. */
export function toIsoDuration(display: string | null | undefined): string | undefined {
  if (!display) return undefined
  const parts = display.split(':').map(Number)
  if (parts.some((n) => Number.isNaN(n))) return undefined
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`
  return undefined
}
