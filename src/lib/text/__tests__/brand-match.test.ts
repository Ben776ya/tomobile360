import { test, expect } from 'vitest'
import { normalizeText, brandMatchesText } from '../brand-match'

test('normalizeText lowercases, strips accents, collapses punctuation to spaces', () => {
  expect(normalizeText('Mercedes-Benz EQE SUV')).toBe('mercedes benz eqe suv')
  expect(normalizeText('Nouveauté — Été 2026')).toBe('nouveaute ete 2026')
})

test('matches a single-token brand as a whole word', () => {
  expect(brandMatchesText('BYD lance la nouvelle Atto 3', 'BYD')).toBe(true)
  expect(brandMatchesText('Les bydonautes du futur', 'BYD')).toBe(false)
})

test('matches a long brand via its first token', () => {
  expect(brandMatchesText('Essai Peugeot 208 GT', 'Peugeot')).toBe(true)
})

test('multi-word brand matches via alias when only part is written', () => {
  expect(brandMatchesText('Essai Mercedes EQE au Maroc', 'Mercedes-Benz')).toBe(true)
  expect(brandMatchesText('Essai Mercedes-Benz EQE', 'Mercedes-Benz')).toBe(true)
})

test('rejects when the brand is absent', () => {
  expect(brandMatchesText('Comparatif des SUV hybrides 2026', 'BYD')).toBe(false)
})

test('is accent and case insensitive', () => {
  expect(brandMatchesText('ŠKODA Kodiaq présentation', 'Škoda')).toBe(true)
})

test('empty haystack or empty brand does not match', () => {
  expect(brandMatchesText('', 'BYD')).toBe(false)
  expect(brandMatchesText('BYD Atto 3', '')).toBe(false)
})
