/**
 * URL → embeddable media, for the `::embed{url="…"}` article block.
 *
 * Only URLs from an allowlisted provider ever become an iframe, and the iframe
 * `src` is rebuilt from the extracted id — the pasted URL is never framed
 * as-is. Everything else falls back to a plain link on the public page.
 * Pure — no I/O.
 */

export type EmbedProvider =
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'facebook'
  | 'instagram'
  | 'tiktok'

/**
 * - landscape: 16:9 player
 * - portrait: 9:16 player (Shorts, Reels, TikTok)
 * - post: social post card whose height depends on its content
 */
export type EmbedShape = 'landscape' | 'portrait' | 'post'

export interface EmbedInfo {
  provider: EmbedProvider
  /** Human label, e.g. "YouTube". */
  label: string
  /** iframe src — always on one of EMBED_FRAME_ORIGINS. */
  src: string
  shape: EmbedShape
  /** Poster image for a click-to-load facade, when the provider exposes one. */
  thumbnail: string | null
  /** Canonical https URL of the content (for "open on …" links). */
  url: string
}

export const EMBED_PROVIDER_LABELS: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

/** Every origin parseEmbedUrl can put in an iframe src (mirrored in the CSP frame-src). */
export const EMBED_FRAME_ORIGINS = [
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com',
  'https://www.dailymotion.com',
  'https://www.facebook.com',
  'https://www.instagram.com',
  'https://www.tiktok.com',
] as const

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const NUMERIC_ID = /^\d+$/
const DAILYMOTION_ID = /^[A-Za-z0-9]+$/
const INSTAGRAM_CODE = /^[A-Za-z0-9_-]+$/
const TIKTOK_ID = /^\d{8,25}$/
const SAFE_TOKEN = /^[A-Za-z0-9._-]+$/

/** Parse user input into a URL, tolerating a missing scheme ("youtu.be/…"). */
function toUrl(input: string): URL | null {
  let raw = input.trim().replace(/^<|>$/g, '')
  if (!raw) return null
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    // Bare domain such as "www.youtube.com/watch?v=…" — assume https.
    if (!/^[a-z0-9-]+\.[a-z0-9.-]+(?:[/?]|$)/i.test(raw)) return null
    raw = `https://${raw}`
  }
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

/** Lower-case host without the common www./m./mobile./web. prefixes. */
function baseHost(url: URL): string {
  return url.hostname.toLowerCase().replace(/^(www|m|mobile|web|mbasic)\./, '')
}

function segments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean)
}

/** YouTube `t` / `start` value ("90", "90s", "1m30s", "1h2m3s") → seconds. */
function parseStartSeconds(value: string | null): number | null {
  if (!value) return null
  if (/^\d+s?$/.test(value)) return parseInt(value, 10) || null
  // h / m / s parts, each at most once and in that order.
  const factors: Record<string, number> = { h: 3600, m: 60, s: 1 }
  let total = 0
  let consumed = ''
  let lastRank = -1
  for (const [, amount, unit] of Array.from(value.matchAll(/(\d+)([hms])/g))) {
    const rank = 'hms'.indexOf(unit)
    if (rank <= lastRank) return null
    lastRank = rank
    total += parseInt(amount, 10) * factors[unit]
    consumed += amount + unit
  }
  return consumed === value && total > 0 ? total : null
}

function youtube(url: URL, host: string): EmbedInfo | null {
  const parts = segments(url)
  let id: string | null = null
  let portrait = false

  if (host === 'youtu.be') {
    id = parts[0] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') id = url.searchParams.get('v')
    else if (parts[0] === 'shorts') { id = parts[1] ?? null; portrait = true }
    else if (parts[0] === 'embed' || parts[0] === 'live' || parts[0] === 'v') id = parts[1] ?? null
  }
  if (!id || !YOUTUBE_ID.test(id)) return null

  const start = parseStartSeconds(url.searchParams.get('t') ?? url.searchParams.get('start'))
  return {
    provider: 'youtube',
    label: EMBED_PROVIDER_LABELS.youtube,
    src: `https://www.youtube-nocookie.com/embed/${id}?rel=0${start ? `&start=${start}` : ''}`,
    shape: portrait ? 'portrait' : 'landscape',
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    url: portrait
      ? `https://www.youtube.com/shorts/${id}`
      : `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`,
  }
}

function vimeo(url: URL, host: string): EmbedInfo | null {
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null
  const parts = segments(url)
  let id: string | null = null
  let hash: string | null = url.searchParams.get('h')

  if (host === 'player.vimeo.com') {
    if (parts[0] === 'video') id = parts[1] ?? null
  } else {
    // vimeo.com/123, /123/abcdef (unlisted), /channels/x/123, /groups/x/videos/123, /showcase/x/video/123
    const idx = parts.findIndex((p) => NUMERIC_ID.test(p))
    if (idx >= 0) {
      id = parts[idx]
      const next = parts[idx + 1]
      if (!hash && next && /^[0-9a-f]{6,}$/i.test(next)) hash = next
    }
  }
  if (!id || !NUMERIC_ID.test(id)) return null
  if (hash && !/^[0-9a-f]+$/i.test(hash)) hash = null

  return {
    provider: 'vimeo',
    label: EMBED_PROVIDER_LABELS.vimeo,
    src: `https://player.vimeo.com/video/${id}?dnt=1${hash ? `&h=${hash}` : ''}`,
    shape: 'landscape',
    thumbnail: null,
    url: `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`,
  }
}

function dailymotion(url: URL, host: string): EmbedInfo | null {
  const parts = segments(url)
  let id: string | null = null
  if (host === 'dai.ly') id = parts[0] ?? null
  else if (host === 'dailymotion.com') {
    if (parts[0] === 'video') id = parts[1] ?? null
    else if (parts[0] === 'embed' && parts[1] === 'video') id = parts[2] ?? null
  } else if (host === 'geo.dailymotion.com') {
    id = url.searchParams.get('video')
  }
  // Watch URLs may carry a slug: /video/x8abcd_le-titre
  id = id?.split('_')[0] ?? null
  if (!id || !DAILYMOTION_ID.test(id)) return null

  return {
    provider: 'dailymotion',
    label: EMBED_PROVIDER_LABELS.dailymotion,
    src: `https://www.dailymotion.com/embed/video/${id}`,
    shape: 'landscape',
    thumbnail: `https://www.dailymotion.com/thumbnail/video/${id}`,
    url: `https://www.dailymotion.com/video/${id}`,
  }
}

function facebook(url: URL, host: string): EmbedInfo | null {
  const parts = segments(url)
  let href: string | null = null
  let kind: 'video' | 'reel' | 'post' | null = null

  if (host === 'fb.watch') {
    if (parts[0] && SAFE_TOKEN.test(parts[0])) {
      href = `https://fb.watch/${parts[0]}/`
      kind = 'video'
    }
  } else if (host === 'facebook.com' || host === 'fb.com') {
    const p0 = parts[0]
    const v = url.searchParams.get('v')
    const fbid = url.searchParams.get('fbid')
    const storyFbid = url.searchParams.get('story_fbid')
    const ownerId = url.searchParams.get('id')

    if (p0 === 'watch' && v && NUMERIC_ID.test(v)) {
      href = `https://www.facebook.com/watch/?v=${v}`
      kind = 'video'
    } else if (p0 === 'video.php' && v && NUMERIC_ID.test(v)) {
      href = `https://www.facebook.com/video.php?v=${v}`
      kind = 'video'
    } else if (p0 === 'reel' && parts[1] && NUMERIC_ID.test(parts[1])) {
      href = `https://www.facebook.com/reel/${parts[1]}`
      kind = 'reel'
    } else if (p0 === 'share' && (parts[1] === 'v' || parts[1] === 'r' || parts[1] === 'p') && parts[2] && SAFE_TOKEN.test(parts[2])) {
      href = `https://www.facebook.com/share/${parts[1]}/${parts[2]}/`
      kind = parts[1] === 'v' ? 'video' : parts[1] === 'r' ? 'reel' : 'post'
    } else if (p0 === 'permalink.php' && storyFbid && ownerId && SAFE_TOKEN.test(storyFbid) && NUMERIC_ID.test(ownerId)) {
      href = `https://www.facebook.com/permalink.php?story_fbid=${storyFbid}&id=${ownerId}`
      kind = 'post'
    } else if ((p0 === 'photo' || p0 === 'photo.php') && fbid && NUMERIC_ID.test(fbid)) {
      href = `https://www.facebook.com/photo/?fbid=${fbid}`
      kind = 'post'
    } else if (p0 && SAFE_TOKEN.test(p0)) {
      // /{page}/videos/{id} | /{page}/videos/{slug}/{id} | /{page}/posts/{id} | /{page}/photos/…/{id}
      const section = parts[1]
      const last = parts[parts.length - 1]
      if (section === 'videos' && last && NUMERIC_ID.test(last)) {
        href = `https://www.facebook.com/${p0}/videos/${last}/`
        kind = 'video'
      } else if (section === 'posts' && parts[2] && SAFE_TOKEN.test(parts[2])) {
        href = `https://www.facebook.com/${p0}/posts/${parts[2]}`
        kind = 'post'
      } else if (section === 'photos' && last && NUMERIC_ID.test(last) && parts.every((s) => SAFE_TOKEN.test(s))) {
        href = `https://www.facebook.com/${parts.join('/')}/`
        kind = 'post'
      }
    }
  }
  if (!href || !kind) return null

  const enc = encodeURIComponent(href)
  return {
    provider: 'facebook',
    label: EMBED_PROVIDER_LABELS.facebook,
    src:
      kind === 'post'
        ? `https://www.facebook.com/plugins/post.php?href=${enc}&show_text=true&width=500`
        : `https://www.facebook.com/plugins/video.php?href=${enc}&show_text=false&width=560`,
    shape: kind === 'post' ? 'post' : kind === 'reel' ? 'portrait' : 'landscape',
    thumbnail: null,
    url: href,
  }
}

function instagram(url: URL, host: string): EmbedInfo | null {
  if (host !== 'instagram.com') return null
  const parts = segments(url)
  // /p/CODE, /reel/CODE, /reels/CODE, /tv/CODE — optionally prefixed by /{username}
  const kinds = ['p', 'reel', 'reels', 'tv']
  const idx = parts.findIndex((p) => kinds.includes(p))
  if (idx < 0 || idx > 1) return null
  const code = parts[idx + 1]
  if (!code || !INSTAGRAM_CODE.test(code)) return null
  const kind = parts[idx] === 'reels' ? 'reel' : parts[idx]

  return {
    provider: 'instagram',
    label: EMBED_PROVIDER_LABELS.instagram,
    src: `https://www.instagram.com/${kind}/${code}/embed/`,
    shape: 'post',
    thumbnail: null,
    url: `https://www.instagram.com/${kind}/${code}/`,
  }
}

function tiktok(url: URL, host: string): EmbedInfo | null {
  if (host !== 'tiktok.com') return null
  const parts = segments(url)
  let id: string | null = null
  if (parts[0]?.startsWith('@') && parts[1] === 'video') id = parts[2] ?? null
  else if (parts[0] === 'embed') id = (parts[1] === 'v2' ? parts[2] : parts[1]) ?? null
  else if (parts[0] === 'player' && parts[1] === 'v1') id = parts[2] ?? null
  else if (parts[0] === 'v') id = parts[1]?.replace(/\.html$/, '') ?? null
  if (!id || !TIKTOK_ID.test(id)) return null

  const user = parts[0]?.startsWith('@') && SAFE_TOKEN.test(parts[0].slice(1)) ? parts[0] : null
  return {
    provider: 'tiktok',
    label: EMBED_PROVIDER_LABELS.tiktok,
    src: `https://www.tiktok.com/player/v1/${id}?rel=0`,
    shape: 'portrait',
    thumbnail: null,
    url: user ? `https://www.tiktok.com/${user}/video/${id}` : `https://www.tiktok.com/embed/v2/${id}`,
  }
}

/** Resolve a pasted URL to an embeddable player, or null when unsupported. */
export function parseEmbedUrl(input: string | null | undefined): EmbedInfo | null {
  if (!input) return null
  const url = toUrl(input)
  if (!url) return null
  const host = baseHost(url)
  return (
    youtube(url, host) ??
    vimeo(url, host) ??
    dailymotion(url, host) ??
    facebook(url, host) ??
    instagram(url, host) ??
    tiktok(url, host)
  )
}

/** A normalized http(s) URL for a plain link, or null if the input is not a web URL. */
export function toSafeLinkUrl(input: string | null | undefined): string | null {
  if (!input) return null
  return toUrl(input)?.toString() ?? null
}

/**
 * French explanation for the editor when a URL cannot be embedded, or null
 * when it can. Short links are called out because they hide the video id.
 */
export function describeEmbedProblem(input: string | null | undefined): string | null {
  if (!input || !input.trim()) return 'Collez l’adresse (URL) de la vidéo ou de la publication.'
  if (parseEmbedUrl(input)) return null
  const url = toUrl(input)
  if (!url) return 'Adresse invalide. Copiez le lien complet depuis la barre d’adresse (https://…).'
  const host = baseHost(url)
  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    return 'Lien court TikTok : ouvrez-le dans le navigateur puis copiez l’adresse complète (tiktok.com/@…/video/…).'
  }
  if (host === 'instagram.com') {
    return 'Utilisez le lien d’une publication ou d’un reel Instagram (instagram.com/p/… ou /reel/…).'
  }
  if (host === 'facebook.com' || host === 'fb.com') {
    return 'Utilisez le lien d’une vidéo, d’un reel ou d’une publication Facebook (bouton Partager → Copier le lien).'
  }
  if (host === 'youtube.com' || host === 'youtu.be') {
    return 'Utilisez le lien d’une vidéo YouTube (youtube.com/watch?v=… ou youtu.be/…).'
  }
  return 'Ce site n’est pas pris en charge : le lien s’affichera comme un simple lien. Sources acceptées : YouTube, Vimeo, Dailymotion, Facebook, Instagram, TikTok.'
}
