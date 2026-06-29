import { test, expect } from 'vitest'
import { articleMatchesBrand, filterArticlesForBrand } from '../match-article-to-brand'

test('matches when the brand is in the title', () => {
  expect(articleMatchesBrand('BYD lance la nouvelle Atto 3 au Maroc', [], 'BYD')).toBe(true)
})

test('matches when the brand is only in the tags', () => {
  expect(articleMatchesBrand('Les nouveautés du salon de Casablanca', ['BYD', 'SUV'], 'BYD')).toBe(true)
})

test('does not match when the brand is in neither title nor tags', () => {
  expect(articleMatchesBrand('Comparatif des SUV hybrides 2026', ['hybride'], 'BYD')).toBe(false)
})

test('handles null tags', () => {
  expect(articleMatchesBrand('Essai Renault Clio 6', null, 'Renault')).toBe(true)
})

test('uses the shared brand alias (Mercedes-Benz → Mercedes)', () => {
  expect(articleMatchesBrand('Essai Mercedes EQE SUV', null, 'Mercedes-Benz')).toBe(true)
})

test('filterArticlesForBrand keeps matches, preserves order, and caps at limit', () => {
  const posts = [
    { id: '1', title: 'BYD Atto 3 prix', tags: null },
    { id: '2', title: 'Marché auto 2026', tags: ['general'] },
    { id: '3', title: 'Salon de Casablanca', tags: ['BYD'] },
    { id: '4', title: 'BYD Seal autonomie', tags: null },
    { id: '5', title: 'BYD Dolphin essai', tags: null },
  ]
  const result = filterArticlesForBrand(posts, 'BYD', 3)
  expect(result.map((p) => p.id)).toEqual(['1', '3', '4'])
})
