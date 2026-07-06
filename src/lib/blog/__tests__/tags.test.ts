import { describe, it, expect } from 'vitest'
import { normalizeTags, filterByTag } from '../tags'

describe('normalizeTags', () => {
  it('splits a glued hashtag chunk into individual tags', () => {
    const raw = [
      '#AFRIQUEAUTOMOBILE#ALGÉRIEINDUSTRIE#AUTOMOBILEMONDIALE#FASTLANE2030',
    ]
    expect(normalizeTags(raw)).toEqual([
      'AFRIQUEAUTOMOBILE',
      'ALGÉRIEINDUSTRIE',
      'AUTOMOBILEMONDIALE',
      'FASTLANE2030',
    ])
  })

  it('leaves already-clean tags untouched', () => {
    expect(normalizeTags(['electrique', 'SUV'])).toEqual(['electrique', 'SUV'])
  })

  it('handles a single leading-# tag', () => {
    expect(normalizeTags(['#Maroc'])).toEqual(['Maroc'])
  })

  it('also splits on commas and newlines', () => {
    expect(normalizeTags(['Maroc, BYD\nStellantis'])).toEqual([
      'Maroc',
      'BYD',
      'Stellantis',
    ])
  })

  it('de-duplicates case-insensitively, keeping the first form', () => {
    expect(normalizeTags(['#Maroc#maroc#MAROC'])).toEqual(['Maroc'])
  })

  it('drops empty fragments and whitespace-only entries', () => {
    expect(normalizeTags(['##  ##', '', '   '])).toEqual([])
  })

  it('returns [] for null/undefined', () => {
    expect(normalizeTags(null)).toEqual([])
    expect(normalizeTags(undefined)).toEqual([])
  })
})

describe('filterByTag', () => {
  const posts = [
    { id: 'a', tags: ['BYD Maroc', 'SUV 2026'] },
    { id: 'b', tags: ['byd maroc', 'Nouveautés 2026'] }, // different casing
    { id: 'c', tags: ['#FASTLANE2030#STELLANTISMEA'] },   // glued
    { id: 'd', tags: null },
    { id: 'e', tags: ['Renault Boreal'] },
  ]

  it('matches case-insensitively across casing variants', () => {
    expect(filterByTag(posts, 'BYD Maroc').map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('matches a token inside a glued tag entry', () => {
    expect(filterByTag(posts, 'FASTLANE2030').map((p) => p.id)).toEqual(['c'])
  })

  it('returns [] when nothing matches', () => {
    expect(filterByTag(posts, 'Peugeot')).toEqual([])
  })

  it('ignores posts with null tags', () => {
    expect(filterByTag(posts, 'anything').every((p) => p.id !== 'd')).toBe(true)
  })

  it('returns [] for a blank tag', () => {
    expect(filterByTag(posts, '   ')).toEqual([])
  })
})
