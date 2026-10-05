import { describe, it, expect } from 'vitest'
import {
  EMBED_FRAME_ORIGINS,
  describeEmbedProblem,
  parseEmbedUrl,
  toSafeLinkUrl,
} from '../embeds'

const YT = 'dQw4w9WgXcQ'

describe('parseEmbedUrl — YouTube', () => {
  it.each([
    `https://www.youtube.com/watch?v=${YT}`,
    `https://youtube.com/watch?v=${YT}&list=PL123&index=2`,
    `https://m.youtube.com/watch?v=${YT}`,
    `https://youtu.be/${YT}`,
    `https://youtu.be/${YT}?si=abcdef`,
    `https://www.youtube.com/embed/${YT}`,
    `https://www.youtube.com/live/${YT}?feature=share`,
    `https://www.youtube-nocookie.com/embed/${YT}`,
    `youtube.com/watch?v=${YT}`,
    `  www.youtube.com/watch?v=${YT}  `,
  ])('%s → privacy-enhanced landscape player', (input) => {
    const info = parseEmbedUrl(input)
    expect(info).not.toBeNull()
    expect(info!.provider).toBe('youtube')
    expect(info!.shape).toBe('landscape')
    expect(info!.src).toBe(`https://www.youtube-nocookie.com/embed/${YT}?rel=0`)
    expect(info!.thumbnail).toBe(`https://i.ytimg.com/vi/${YT}/hqdefault.jpg`)
  })

  it('treats Shorts as portrait', () => {
    const info = parseEmbedUrl(`https://www.youtube.com/shorts/${YT}`)
    expect(info?.shape).toBe('portrait')
    expect(info?.url).toBe(`https://www.youtube.com/shorts/${YT}`)
  })

  it.each([
    ['90', 90],
    ['90s', 90],
    ['1m30s', 90],
    ['1h2m3s', 3723],
  ])('keeps the start time t=%s', (t, seconds) => {
    const info = parseEmbedUrl(`https://youtu.be/${YT}?t=${t}`)
    expect(info?.src).toBe(`https://www.youtube-nocookie.com/embed/${YT}?rel=0&start=${seconds}`)
  })

  it('rejects malformed ids and channel pages', () => {
    expect(parseEmbedUrl('https://www.youtube.com/watch?v=short')).toBeNull()
    expect(parseEmbedUrl('https://www.youtube.com/@tomobile360')).toBeNull()
    expect(parseEmbedUrl(`https://www.youtube.com/watch?v=${YT}"onload="x`)).toBeNull()
  })
})

describe('parseEmbedUrl — Vimeo / Dailymotion', () => {
  it.each([
    ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871?dnt=1'],
    ['https://vimeo.com/channels/staffpicks/76979871', 'https://player.vimeo.com/video/76979871?dnt=1'],
    ['https://vimeo.com/76979871/a1b2c3d4e5', 'https://player.vimeo.com/video/76979871?dnt=1&h=a1b2c3d4e5'],
    ['https://player.vimeo.com/video/76979871?h=a1b2c3d4e5', 'https://player.vimeo.com/video/76979871?dnt=1&h=a1b2c3d4e5'],
  ])('%s', (input, src) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('vimeo')
    expect(info?.src).toBe(src)
  })

  it.each([
    'https://www.dailymotion.com/video/x8abcd1',
    'https://www.dailymotion.com/video/x8abcd1_le-titre-de-la-video',
    'https://dai.ly/x8abcd1',
    'https://www.dailymotion.com/embed/video/x8abcd1',
  ])('%s', (input) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('dailymotion')
    expect(info?.src).toBe('https://www.dailymotion.com/embed/video/x8abcd1')
  })
})

describe('parseEmbedUrl — Facebook', () => {
  it.each([
    ['https://www.facebook.com/watch/?v=1234567890', 'landscape'],
    ['https://www.facebook.com/RenaultMaroc/videos/1234567890/', 'landscape'],
    ['https://www.facebook.com/RenaultMaroc/videos/un-titre/1234567890/', 'landscape'],
    ['https://m.facebook.com/video.php?v=1234567890', 'landscape'],
    ['https://fb.watch/abCD12_xy/', 'landscape'],
    ['https://www.facebook.com/share/v/1AbCdEf/', 'landscape'],
    ['https://www.facebook.com/reel/1234567890', 'portrait'],
    ['https://www.facebook.com/share/r/1AbCdEf/', 'portrait'],
  ])('%s → video plugin (%s)', (input, shape) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('facebook')
    expect(info?.shape).toBe(shape)
    expect(info?.src.startsWith('https://www.facebook.com/plugins/video.php?href=')).toBe(true)
  })

  it.each([
    'https://www.facebook.com/RenaultMaroc/posts/pfbid02abcDEF',
    'https://www.facebook.com/permalink.php?story_fbid=123456&id=987654',
    'https://www.facebook.com/photo/?fbid=1234567890&set=a.1',
    'https://www.facebook.com/share/p/1AbCdEf/',
  ])('%s → post plugin', (input) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('facebook')
    expect(info?.shape).toBe('post')
    expect(info?.src.startsWith('https://www.facebook.com/plugins/post.php?href=')).toBe(true)
  })

  it('URL-encodes the href passed to the plugin', () => {
    const info = parseEmbedUrl('https://www.facebook.com/watch/?v=1234567890')
    expect(info?.src).toContain(encodeURIComponent('https://www.facebook.com/watch/?v=1234567890'))
  })

  it('rejects profile and group pages', () => {
    expect(parseEmbedUrl('https://www.facebook.com/RenaultMaroc')).toBeNull()
    expect(parseEmbedUrl('https://www.facebook.com/groups/12345')).toBeNull()
  })
})

describe('parseEmbedUrl — Instagram / TikTok', () => {
  it.each([
    ['https://www.instagram.com/p/C8AbCdEfGh/', 'https://www.instagram.com/p/C8AbCdEfGh/embed/'],
    ['https://instagram.com/p/C8AbCdEfGh/?igsh=xyz', 'https://www.instagram.com/p/C8AbCdEfGh/embed/'],
    ['https://www.instagram.com/reel/C8AbCdEfGh/', 'https://www.instagram.com/reel/C8AbCdEfGh/embed/'],
    ['https://www.instagram.com/reels/C8AbCdEfGh/', 'https://www.instagram.com/reel/C8AbCdEfGh/embed/'],
    ['https://www.instagram.com/tv/C8AbCdEfGh/', 'https://www.instagram.com/tv/C8AbCdEfGh/embed/'],
    ['https://www.instagram.com/tomobile360/p/C8AbCdEfGh/', 'https://www.instagram.com/p/C8AbCdEfGh/embed/'],
  ])('%s', (input, src) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('instagram')
    expect(info?.shape).toBe('post')
    expect(info?.src).toBe(src)
  })

  it('rejects an Instagram profile', () => {
    expect(parseEmbedUrl('https://www.instagram.com/tomobile360/')).toBeNull()
  })

  it.each([
    'https://www.tiktok.com/@tomobile360/video/7312345678901234567',
    'https://www.tiktok.com/@tomobile360/video/7312345678901234567?is_from_webapp=1',
    'https://www.tiktok.com/embed/v2/7312345678901234567',
    'https://www.tiktok.com/player/v1/7312345678901234567',
    'https://m.tiktok.com/v/7312345678901234567.html',
  ])('%s', (input) => {
    const info = parseEmbedUrl(input)
    expect(info?.provider).toBe('tiktok')
    expect(info?.shape).toBe('portrait')
    expect(info?.src).toBe('https://www.tiktok.com/player/v1/7312345678901234567?rel=0')
  })

  it('cannot resolve TikTok short links and says why', () => {
    expect(parseEmbedUrl('https://vm.tiktok.com/ZMabc123/')).toBeNull()
    expect(describeEmbedProblem('https://vm.tiktok.com/ZMabc123/')).toMatch(/Lien court TikTok/)
  })
})

describe('parseEmbedUrl — hostile and unsupported input', () => {
  it.each([
    `https://youtube.com.evil.example/watch?v=${YT}`,
    `https://evil.example/watch?v=${YT}&youtube.com`,
    `https://notyoutube.com/watch?v=${YT}`,
    `https://evil.example/youtu.be/${YT}`,
    `javascript:alert(1)//youtube.com/watch?v=${YT}`,
    `data:text/html,<script>alert(1)</script>`,
    `ftp://youtube.com/watch?v=${YT}`,
    `https://user:pass@www.youtube.com/watch?v=${YT}`,
    'https://www.example.com/video.mp4',
    'not a url at all',
    '',
  ])('rejects %s', (input) => {
    expect(parseEmbedUrl(input)).toBeNull()
  })

  it('every src it produces is on an allowlisted frame origin', () => {
    const samples = [
      `https://youtu.be/${YT}`,
      'https://vimeo.com/76979871',
      'https://dai.ly/x8abcd1',
      'https://www.facebook.com/watch/?v=1234567890',
      'https://www.facebook.com/share/p/1AbCdEf/',
      'https://www.instagram.com/p/C8AbCdEfGh/',
      'https://www.tiktok.com/@a/video/7312345678901234567',
    ]
    for (const s of samples) {
      const info = parseEmbedUrl(s)
      expect(info, s).not.toBeNull()
      expect(EMBED_FRAME_ORIGINS).toContain(new URL(info!.src).origin)
    }
  })

  it('explains unsupported sites and accepts supported ones', () => {
    expect(describeEmbedProblem('https://www.example.com/x')).toMatch(/pas pris en charge/)
    expect(describeEmbedProblem(`https://youtu.be/${YT}`)).toBeNull()
    expect(describeEmbedProblem('')).toMatch(/Collez/)
  })

  it('toSafeLinkUrl only returns web URLs', () => {
    expect(toSafeLinkUrl('https://www.example.com/a')).toBe('https://www.example.com/a')
    expect(toSafeLinkUrl('example.com/a')).toBe('https://example.com/a')
    expect(toSafeLinkUrl('javascript:alert(1)')).toBeNull()
  })
})
