import { describe, it, expect } from 'vitest'
import {
  getVideoProvider,
  getVideoId,
  getVideoEmbedUrl,
  getYouTubeThumbnail,
  toIsoDuration,
} from '../youtube'

describe('getVideoProvider', () => {
  it('detects youtube, vimeo, and other', () => {
    expect(getVideoProvider('https://youtu.be/abc')).toBe('youtube')
    expect(getVideoProvider('https://www.youtube.com/watch?v=abc')).toBe('youtube')
    expect(getVideoProvider('https://vimeo.com/1')).toBe('vimeo')
    expect(getVideoProvider('https://example.com/v')).toBe('other')
    expect(getVideoProvider('')).toBe('other')
  })
})

describe('getVideoId', () => {
  it('parses youtu.be short links', () => {
    expect(getVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getVideoId('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ')
  })
  it('parses watch?v= links (ignoring extra params)', () => {
    expect(getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL')).toBe('dQw4w9WgXcQ')
  })
  it('parses embed and shorts links', () => {
    expect(getVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('parses vimeo links', () => {
    expect(getVideoId('https://vimeo.com/123456789')).toBe('123456789')
  })
  it('returns null for empty/unknown', () => {
    expect(getVideoId('')).toBeNull()
    expect(getVideoId('https://example.com/x')).toBeNull()
  })
})

describe('getVideoEmbedUrl', () => {
  it('builds youtube embed urls from any youtube form', () => {
    expect(getVideoEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    )
    expect(getVideoEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123')
  })
  it('builds vimeo embed urls', () => {
    expect(getVideoEmbedUrl('https://vimeo.com/123')).toBe('https://player.vimeo.com/video/123')
  })
  it('returns the original url when unrecognised', () => {
    expect(getVideoEmbedUrl('https://example.com/v')).toBe('https://example.com/v')
  })
})

describe('getYouTubeThumbnail', () => {
  it('derives an hqdefault thumbnail for youtube', () => {
    expect(getYouTubeThumbnail('https://youtu.be/abc123')).toBe(
      'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
    )
  })
  it('returns null for non-youtube', () => {
    expect(getYouTubeThumbnail('https://vimeo.com/1')).toBeNull()
  })
})

describe('toIsoDuration', () => {
  it('converts MM:SS', () => {
    expect(toIsoDuration('12:34')).toBe('PT12M34S')
  })
  it('converts H:MM:SS', () => {
    expect(toIsoDuration('1:02:03')).toBe('PT1H2M3S')
  })
  it('returns undefined for empty/invalid', () => {
    expect(toIsoDuration(null)).toBeUndefined()
    expect(toIsoDuration(undefined)).toBeUndefined()
    expect(toIsoDuration('')).toBeUndefined()
    expect(toIsoDuration('abc')).toBeUndefined()
  })
})
