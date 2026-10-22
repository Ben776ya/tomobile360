import { describe, it, expect } from 'vitest'
import { videoCategoryLabel } from '../categories'

describe('videoCategoryLabel', () => {
  it('maps every stored category to French', () => {
    // The five values present in production `videos.category`.
    expect(videoCategoryLabel('news')).toBe('Actualité')
    expect(videoCategoryLabel('review')).toBe('Essai')
    expect(videoCategoryLabel('comparison')).toBe('Comparatif')
    expect(videoCategoryLabel('guide')).toBe('Guide')
    expect(videoCategoryLabel('event')).toBe('Événement')
  })

  it('falls back to the raw value, and to empty for no category', () => {
    expect(videoCategoryLabel('podcast')).toBe('podcast')
    expect(videoCategoryLabel(null)).toBe('')
    expect(videoCategoryLabel(undefined)).toBe('')
  })
})
