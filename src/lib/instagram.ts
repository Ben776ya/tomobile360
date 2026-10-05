import 'server-only'

import { EXTERNAL_LINKS } from '@/lib/links'

/** A reel shown in the homepage reels panel. */
export interface InstagramReel {
  /** Shortcode — the CODE in instagram.com/reel/CODE/ */
  code: string
  permalink: string
  /**
   * Playable MP4 from the Instagram API. Null when the API isn't configured or
   * withholds it (Instagram omits media_url for reels with licensed audio) —
   * the panel then shows Instagram's own embed for that reel.
   */
  videoUrl: string | null
  posterUrl: string | null
  caption: string | null
}

export const INSTAGRAM_HANDLE = 'tomobile360.ma'
export const INSTAGRAM_PROFILE_URL = EXTERNAL_LINKS.INSTAGRAM

// Latest reels published by @tomobile360.ma (newest first, checked 2026-10-05).
// Shown when INSTAGRAM_ACCESS_TOKEN is unset or the API call fails.
const CURATED_REEL_CODES = [
  'DdUK3u-AHzj',
  'DdEwqCaAcb7',
  'DcjRhachDuc',
  'Db3nGiAuf_B',
  'DbdWAbFgD39',
  'DbVwwCloDG-',
  'Da3DjFFgF0z',
  'DavZEZztcml',
  'DaVy1o3uioF',
  'DaCxU2CsZMm',
  'DZV7f12oQzc',
  'DZKy91soBg0',
]

const MEDIA_ENDPOINT = 'https://graph.instagram.com/me/media'
const MEDIA_FIELDS = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink'
const REVALIDATE_SECONDS = 3600
const TIMEOUT_MS = 5000
const SHORTCODE = /^[A-Za-z0-9_-]+$/

export const MAX_REELS = 12

export function curatedReels(): InstagramReel[] {
  return CURATED_REEL_CODES.map((code) => ({
    code,
    permalink: `https://www.instagram.com/reel/${code}/`,
    videoUrl: null,
    posterUrl: null,
    caption: null,
  }))
}

/** Shortcode from a post/reel permalink, or null if it isn't one. */
export function reelCode(permalink: string): string | null {
  let url: URL
  try {
    url = new URL(permalink)
  } catch {
    return null
  }
  if (url.hostname.replace(/^www\./, '') !== 'instagram.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  const idx = parts.findIndex((p) => p === 'reel' || p === 'reels' || p === 'p')
  const code = idx >= 0 ? parts[idx + 1] : undefined
  return code && SHORTCODE.test(code) ? code : null
}

const httpsUrl = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('https://') ? value : null

/** Picks the reels out of a `/me/media` response page. */
export function parseReels(payload: unknown, limit = MAX_REELS): InstagramReel[] {
  const data = (payload as { data?: unknown } | null)?.data
  if (!Array.isArray(data)) return []

  const reels: InstagramReel[] = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const media = item as Record<string, unknown>
    if (media.media_product_type !== 'REELS' || media.media_type !== 'VIDEO') continue
    const permalink = httpsUrl(media.permalink)
    const code = permalink ? reelCode(permalink) : null
    if (!permalink || !code) continue
    reels.push({
      code,
      permalink,
      videoUrl: httpsUrl(media.media_url),
      posterUrl: httpsUrl(media.thumbnail_url),
      caption: typeof media.caption === 'string' && media.caption.trim() ? media.caption.trim() : null,
    })
    if (reels.length >= limit) break
  }
  return reels
}

/**
 * Latest reels of the account, via the Instagram API (Instagram Login,
 * `instagram_business_basic`) when INSTAGRAM_ACCESS_TOKEN is set, cached for
 * an hour. Never throws: any failure falls back to the curated list so the
 * homepage always renders the panel.
 */
export async function getInstagramReels(limit = MAX_REELS): Promise<InstagramReel[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return curatedReels().slice(0, limit)

  try {
    const res = await fetch(`${MEDIA_ENDPOINT}?fields=${MEDIA_FIELDS}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['instagram-reels'] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const reels = parseReels(await res.json(), limit)
    if (reels.length === 0) throw new Error('no reels in the media feed')
    return reels
  } catch (err) {
    console.warn('[instagram] using curated reels:', err instanceof Error ? err.message : err)
    return curatedReels().slice(0, limit)
  }
}
