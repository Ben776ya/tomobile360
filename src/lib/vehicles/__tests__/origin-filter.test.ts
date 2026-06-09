import { describe, test, expect } from 'vitest'
import { resolveOriginDbValue, ORIGIN_PARAM_TO_DB, ORIGIN_LABELS } from '../origin-filter'

describe('resolveOriginDbValue', () => {
  test('known slug maps to DB value', () => {
    expect(resolveOriginDbValue('chinese')).toBe('China')
  })

  test('is case-insensitive', () => {
    expect(resolveOriginDbValue('Chinese')).toBe('China')
    expect(resolveOriginDbValue('CHINESE')).toBe('China')
  })

  test('empty / undefined / null returns null', () => {
    expect(resolveOriginDbValue(undefined)).toBeNull()
    expect(resolveOriginDbValue(null)).toBeNull()
    expect(resolveOriginDbValue('')).toBeNull()
  })

  test('unknown slug returns null', () => {
    expect(resolveOriginDbValue('german')).toBeNull()
  })
})

test('every mapped origin DB value has a display label', () => {
  for (const dbValue of Object.values(ORIGIN_PARAM_TO_DB)) {
    expect(ORIGIN_LABELS[dbValue], `missing ORIGIN_LABELS entry for ${dbValue}`).toBeTruthy()
  }
})
