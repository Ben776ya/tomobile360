import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveOriginDbValue, ORIGIN_PARAM_TO_DB, ORIGIN_LABELS } from '../origin-filter'

test('resolveOriginDbValue — known slug maps to DB value', () => {
  assert.equal(resolveOriginDbValue('chinese'), 'China')
})

test('resolveOriginDbValue — is case-insensitive', () => {
  assert.equal(resolveOriginDbValue('Chinese'), 'China')
  assert.equal(resolveOriginDbValue('CHINESE'), 'China')
})

test('resolveOriginDbValue — empty / undefined / null returns null', () => {
  assert.equal(resolveOriginDbValue(undefined), null)
  assert.equal(resolveOriginDbValue(null), null)
  assert.equal(resolveOriginDbValue(''), null)
})

test('resolveOriginDbValue — unknown slug returns null', () => {
  assert.equal(resolveOriginDbValue('german'), null)
})

test('every mapped origin DB value has a display label', () => {
  for (const dbValue of Object.values(ORIGIN_PARAM_TO_DB)) {
    assert.ok(ORIGIN_LABELS[dbValue], `missing ORIGIN_LABELS entry for ${dbValue}`)
  }
})
