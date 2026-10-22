import { describe, it, expect } from 'vitest'
import { estimateUsedPrice, type EstimateInput } from '../estimate'

// The audit's case: 2021, 60 000 km, « Bon », estimated in 2026.
const auditCase: EstimateInput = {
  year: 2021,
  mileage: 60000,
  condition: 'Bon',
  currentYear: 2026,
  similarPrices: [],
  cataloguePrice: null,
}

// Catalogue prices from vehicles_new (2026-10-22).
const DUSTER = 202000
const SANDERO_STREETWAY = 128000
const PORSCHE_911 = 1199000

describe('estimateUsedPrice — catalogue basis', () => {
  it('reproduces the old formula when the base is 200 000 (audit figures)', () => {
    const r = estimateUsedPrice({ ...auditCase, cataloguePrice: 200000 })
    expect(r).toMatchObject({ min: 63814, max: 86336, average: 75075 })
  })

  it('gives different results for different models purely from their catalogue prices', () => {
    const duster = estimateUsedPrice({ ...auditCase, cataloguePrice: DUSTER })!
    const sandero = estimateUsedPrice({ ...auditCase, cataloguePrice: SANDERO_STREETWAY })!
    const porsche = estimateUsedPrice({ ...auditCase, cataloguePrice: PORSCHE_911 })!

    expect(sandero.average).toBeLessThan(duster.average)
    expect(porsche.average).toBeGreaterThan(duster.average)
    // Same age/mileage/condition → estimates scale exactly with the base price.
    expect(porsche.average / duster.average).toBeCloseTo(PORSCHE_911 / DUSTER, 3)
    expect(duster.basis).toEqual({ kind: 'catalogue', price: DUSTER })
    expect(duster.min).toBeLessThan(duster.average)
    expect(duster.max).toBeGreaterThan(duster.average)
  })

  it('returns no estimate when the model has no catalogue price and no similar listings', () => {
    expect(estimateUsedPrice({ ...auditCase, cataloguePrice: null })).toBeNull()
    expect(estimateUsedPrice({ ...auditCase, cataloguePrice: 0 })).toBeNull()
  })

  it('still applies the condition', () => {
    const bon = estimateUsedPrice({ ...auditCase, cataloguePrice: DUSTER })!
    const excellent = estimateUsedPrice({ ...auditCase, condition: 'Excellent', cataloguePrice: DUSTER })!
    const acceptable = estimateUsedPrice({ ...auditCase, condition: 'Acceptable', cataloguePrice: DUSTER })!
    expect(excellent.average).toBeGreaterThan(bon.average)
    expect(acceptable.average).toBeLessThan(bon.average)
  })

  it('still applies mileage', () => {
    const low = estimateUsedPrice({ ...auditCase, mileage: 20000, cataloguePrice: DUSTER })!
    const high = estimateUsedPrice({ ...auditCase, mileage: 150000, cataloguePrice: DUSTER })!
    expect(low.average).toBeGreaterThan(high.average)
  })

  it('never values an older car above a newer one (15 %/yr for 5 years, then 10 %/yr)', () => {
    let previous = Infinity
    for (let year = 2026; year >= 2006; year--) {
      const r = estimateUsedPrice({ ...auditCase, year, cataloguePrice: DUSTER })!
      expect(r.average).toBeLessThan(previous)
      previous = r.average
    }
  })
})

describe('estimateUsedPrice — similar listings basis', () => {
  it('uses the range of similar asking prices when there are any', () => {
    const r = estimateUsedPrice({ ...auditCase, similarPrices: [150000, 170000, 160000], cataloguePrice: DUSTER })
    expect(r).toEqual({ min: 150000, max: 170000, average: 160000, basis: { kind: 'listings', count: 3 } })
  })
})
