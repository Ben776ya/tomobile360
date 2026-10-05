import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// `server-only` throws outside a Next.js server context; stub it.
vi.mock('server-only', () => ({}))

import { curatedReels, getInstagramReels, parseReels, reelCode } from '../instagram'

const reel = (code: string, extra: Record<string, unknown> = {}) => ({
  id: `id-${code}`,
  media_type: 'VIDEO',
  media_product_type: 'REELS',
  permalink: `https://www.instagram.com/reel/${code}/`,
  media_url: `https://scontent.cdninstagram.com/v/${code}.mp4`,
  thumbnail_url: `https://scontent.cdninstagram.com/v/${code}.jpg`,
  caption: `Essai ${code}`,
  ...extra,
})

describe('reelCode', () => {
  it.each([
    ['https://www.instagram.com/reel/DdUK3u-AHzj/', 'DdUK3u-AHzj'],
    ['https://instagram.com/reels/Db3nGiAuf_B/?igsh=x', 'Db3nGiAuf_B'],
    ['https://www.instagram.com/tomobile360.ma/reel/DbVwwCloDG-/', 'DbVwwCloDG-'],
    ['https://www.instagram.com/p/C8AbCdEfGh/', 'C8AbCdEfGh'],
  ])('%s → %s', (url, code) => {
    expect(reelCode(url)).toBe(code)
  })

  it.each([
    'https://evil.example/reel/abc/',
    'https://www.instagram.com/tomobile360.ma/',
    'https://www.instagram.com/reel/bad%20code/',
    'not a url',
  ])('rejects %s', (url) => {
    expect(reelCode(url)).toBeNull()
  })
})

describe('parseReels', () => {
  it('keeps only reels, in feed order, with video and poster', () => {
    const payload = {
      data: [
        reel('AAA'),
        { ...reel('IMG'), media_type: 'IMAGE', media_product_type: 'FEED' },
        { ...reel('CAR'), media_type: 'CAROUSEL_ALBUM', media_product_type: 'FEED' },
        { ...reel('FEEDVID'), media_product_type: 'FEED' },
        reel('BBB'),
      ],
    }
    expect(parseReels(payload)).toEqual([
      {
        code: 'AAA',
        permalink: 'https://www.instagram.com/reel/AAA/',
        videoUrl: 'https://scontent.cdninstagram.com/v/AAA.mp4',
        posterUrl: 'https://scontent.cdninstagram.com/v/AAA.jpg',
        caption: 'Essai AAA',
      },
      {
        code: 'BBB',
        permalink: 'https://www.instagram.com/reel/BBB/',
        videoUrl: 'https://scontent.cdninstagram.com/v/BBB.mp4',
        posterUrl: 'https://scontent.cdninstagram.com/v/BBB.jpg',
        caption: 'Essai BBB',
      },
    ])
  })

  it('leaves videoUrl null when Instagram withholds media_url (licensed audio) so the embed is used', () => {
    const [item] = parseReels({ data: [{ ...reel('MUSIC'), media_url: undefined }] })
    expect(item.code).toBe('MUSIC')
    expect(item.videoUrl).toBeNull()
    expect(item.posterUrl).toBe('https://scontent.cdninstagram.com/v/MUSIC.jpg')
  })

  it('rejects non-https media and unusable permalinks', () => {
    const items = parseReels({
      data: [
        reel('HTTP', { media_url: 'http://insecure/video.mp4', thumbnail_url: 'javascript:alert(1)' }),
        reel('NOLINK', { permalink: 'https://evil.example/reel/NOLINK/' }),
      ],
    })
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ code: 'HTTP', videoUrl: null, posterUrl: null })
  })

  it('caps the list and blanks empty captions', () => {
    const data = Array.from({ length: 20 }, (_, i) => reel(`R${i}`, { caption: '   ' }))
    const items = parseReels({ data }, 5)
    expect(items.map((r) => r.code)).toEqual(['R0', 'R1', 'R2', 'R3', 'R4'])
    expect(items.every((r) => r.caption === null)).toBe(true)
  })

  it.each([null, undefined, 'x', {}, { data: 'nope' }, { error: { message: 'bad' } }])(
    'returns [] for malformed payload %#',
    (payload) => {
      expect(parseReels(payload)).toEqual([])
    },
  )
})

describe('getInstagramReels', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    fetchMock.mockReset()
  })

  const curatedCodes = curatedReels().map((r) => r.code)

  it('uses the curated list without calling the API when no token is set', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', '')
    const reels = await getInstagramReels()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(reels.map((r) => r.code)).toEqual(curatedCodes)
    expect(reels.every((r) => r.videoUrl === null)).toBe(true)
  })

  it('fetches reels with the token in a Bearer header (never in the URL), cached for an hour', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'IGAA-secret')
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: [reel('AAA'), reel('BBB')] })))

    const reels = await getInstagramReels()

    expect(reels.map((r) => r.code)).toEqual(['AAA', 'BBB'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/^https:\/\/graph\.instagram\.com\/me\/media\?fields=/)
    expect(String(url)).not.toContain('IGAA-secret')
    expect(init.headers).toEqual({ Authorization: 'Bearer IGAA-secret' })
    expect(init.next).toMatchObject({ revalidate: 3600 })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it.each([
    ['an HTTP error', () => Promise.resolve(new Response('{"error":{}}', { status: 400 }))],
    ['a network failure / timeout', () => Promise.reject(new DOMException('timed out', 'TimeoutError'))],
    ['a malformed body', () => Promise.resolve(new Response('<html>'))],
    ['a feed with no reels', () => Promise.resolve(new Response(JSON.stringify({ data: [] })))],
  ])('falls back to the curated list on %s', async (_label, impl) => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'IGAA-secret')
    fetchMock.mockImplementation(impl)
    const reels = await getInstagramReels()
    expect(reels.map((r) => r.code)).toEqual(curatedCodes)
    expect(console.warn).toHaveBeenCalled()
  })
})
