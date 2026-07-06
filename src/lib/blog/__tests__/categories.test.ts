import { describe, it, expect } from 'vitest'
import {
  BLOG_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_PILL_COLORS,
  CATEGORY_TEXT_COLORS,
  ACTU_FILTERS,
} from '../categories'

describe('blog categories', () => {
  it('lists categories in the required order', () => {
    expect(BLOG_CATEGORIES.map((c) => c.value)).toEqual([
      'nouveautes',
      'business',
      'essai',
      'classic-cars',
      'interview',
    ])
  })

  it('exposes labels for the categories as written', () => {
    expect(CATEGORY_LABELS['business']).toBe('Business')
    expect(CATEGORY_LABELS['essai']).toBe('Essai')
    expect(CATEGORY_LABELS['classic-cars']).toBe('Classic Cars')
    expect(CATEGORY_LABELS['interview']).toBe('Interview')
  })

  it('no longer exposes the dropped categories', () => {
    for (const dropped of ['tendances', 'marche', 'reportage', 'pratique']) {
      expect(CATEGORY_LABELS[dropped]).toBeUndefined()
    }
  })

  it('exposes a pill and text color for every category', () => {
    for (const c of BLOG_CATEGORIES) {
      expect(CATEGORY_PILL_COLORS[c.value]).toBeTruthy()
      expect(CATEGORY_TEXT_COLORS[c.value]).toBeTruthy()
    }
  })

  it('prepends "Tout" to the actu filter bar', () => {
    expect(ACTU_FILTERS[0]).toEqual({ value: 'all', label: 'Tout' })
    expect(ACTU_FILTERS).toHaveLength(BLOG_CATEGORIES.length + 1)
  })
})
