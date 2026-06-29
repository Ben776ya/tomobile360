import { describe, test, expect } from 'vitest'
import type { ModelGroup } from '@/components/vehicles/ModelCard'
import { rankSimilarModels, PRICE_BAND, type SimilarityReference } from '../similar-vehicles'

/** Build a ModelGroup with only the fields the ranker reads; rest are filler. */
function group(over: Partial<ModelGroup> & { modelId: string }): ModelGroup {
  return {
    brandId: 'b', brandName: 'Brand', brandLogo: null,
    modelId: over.modelId, modelName: over.modelId,
    minPrice: over.minPrice ?? null, maxPrice: over.maxPrice ?? null,
    mainImage: '/x.svg', versionCount: 1,
    fuelTypes: over.fuelTypes ?? [], transmissions: [],
    hasNewRelease: false, hasPopular: false, hasPromo: false,
    vehicleId: 'v',
  }
}

const ref = (over: Partial<SimilarityReference> = {}): SimilarityReference => ({
  anchorPrice: 300_000, fuelTypes: ['Electric'], origin: 'China', ...over,
})

test('PRICE_BAND is 30%', () => {
  expect(PRICE_BAND).toBe(0.3)
})

test('keeps only same-band candidates ordered by price proximity when scores tie', () => {
  const groups = [
    group({ modelId: 'far-cheap', minPrice: 100_000 }),   // out of band (<210k)
    group({ modelId: 'near-high', minPrice: 330_000 }),   // in band, +30k
    group({ modelId: 'near-low', minPrice: 290_000 }),    // in band, -10k
  ]
  const out = rankSimilarModels(groups, {}, ref({ fuelTypes: [], origin: null }), 4)
  expect(out.map(g => g.modelId)).toEqual(['near-low', 'near-high', 'far-cheap'])
})

test('soft boosts float fuel/origin matches above closer-priced non-matches', () => {
  const groups = [
    group({ modelId: 'closer-nomatch', minPrice: 305_000, fuelTypes: ['Diesel'] }),
    group({ modelId: 'farther-electric', minPrice: 270_000, fuelTypes: ['Electric'] }),
  ]
  const originByModel = { 'closer-nomatch': 'Germany', 'farther-electric': 'France' }
  const out = rankSimilarModels(groups, originByModel, ref(), 4)
  expect(out[0].modelId).toBe('farther-electric') // +2 fuel beats price proximity
})

test('origin boost applies independently of fuel', () => {
  const groups = [
    group({ modelId: 'chinese-diesel', minPrice: 320_000, fuelTypes: ['Diesel'] }),
    group({ modelId: 'french-diesel', minPrice: 310_000, fuelTypes: ['Diesel'] }),
  ]
  const originByModel = { 'chinese-diesel': 'China', 'french-diesel': 'France' }
  const out = rankSimilarModels(groups, originByModel, ref({ fuelTypes: [] }), 4)
  expect(out[0].modelId).toBe('chinese-diesel') // +2 origin
})

test('relaxes price band to fill remaining slots, closest price first', () => {
  const groups = [
    group({ modelId: 'in-band', minPrice: 300_000 }),
    group({ modelId: 'out-near', minPrice: 220_000 }),  // out of band, |Δ|=80k
    group({ modelId: 'out-far', minPrice: 120_000 }),   // out of band, |Δ|=180k
  ]
  const out = rankSimilarModels(groups, {}, ref({ fuelTypes: [], origin: null }), 4)
  expect(out.map(g => g.modelId)).toEqual(['in-band', 'out-near', 'out-far'])
})

test('caps results at the limit', () => {
  const groups = Array.from({ length: 7 }, (_, i) =>
    group({ modelId: `m${i}`, minPrice: 300_000 + i * 1000 }))
  expect(rankSimilarModels(groups, {}, ref(), 4)).toHaveLength(4)
})

test('null anchor price skips the band and ranks by score', () => {
  const groups = [
    group({ modelId: 'cheap-nomatch', minPrice: 50_000, fuelTypes: ['Diesel'] }),
    group({ modelId: 'pricey-electric', minPrice: 900_000, fuelTypes: ['Electric'] }),
  ]
  const out = rankSimilarModels(groups, {}, ref({ anchorPrice: null }), 4)
  expect(out[0].modelId).toBe('pricey-electric') // +2 fuel; no price filter
})

test('groups with null price are eligible only as fallback fillers, ranked last', () => {
  const groups = [
    group({ modelId: 'priced', minPrice: 300_000 }),
    group({ modelId: 'unpriced', minPrice: null }),
  ]
  const out = rankSimilarModels(groups, {}, ref({ fuelTypes: [], origin: null }), 4)
  expect(out.map(g => g.modelId)).toEqual(['priced', 'unpriced'])
})

test('empty input returns empty', () => {
  expect(rankSimilarModels([], {}, ref())).toEqual([])
})
