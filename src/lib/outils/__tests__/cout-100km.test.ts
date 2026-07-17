import { describe, it, expect } from 'vitest'
import {
  costPer100km,
  annualCost,
  computeAll,
  parseEnergyKind,
  fuelTypeToEnergyParam,
  FALLBACK_RATES,
  type CalcInputs,
} from '../cout-100km'

describe('costPer100km', () => {
  it('multiplies consumption by the per-unit rate', () => {
    expect(costPer100km(6.5, 15.2)).toBeCloseTo(98.8, 5)
    expect(costPer100km(16, 1.2)).toBeCloseTo(19.2, 5)
  })

  it('returns 0 for negative or non-finite inputs', () => {
    expect(costPer100km(-1, 15)).toBe(0)
    expect(costPer100km(6, -2)).toBe(0)
    expect(costPer100km(NaN, 15)).toBe(0)
    expect(costPer100km(6, Infinity)).toBe(0)
  })
})

describe('annualCost', () => {
  it('scales the per-100km cost by yearly distance', () => {
    expect(annualCost(100, 15000)).toBe(15000)
    expect(annualCost(98.8, 15000)).toBeCloseTo(14820, 5)
  })

  it('returns 0 for negative distance', () => {
    expect(annualCost(100, -5)).toBe(0)
  })
})

describe('computeAll', () => {
  const inputs: CalcInputs = {
    consumption: { essence: 6.5, diesel: 5.0, hybride: 4.5, electrique: 16 },
    rates: { essence: 15.2, diesel: 13.6, kwh: 1.2 },
    annualKm: 15000,
  }

  it('computes per-100km and annual cost for all four kinds', () => {
    const r = computeAll(inputs)
    expect(r.essence.per100km).toBeCloseTo(98.8, 5)
    expect(r.diesel.per100km).toBeCloseTo(68.0, 5)
    // Hybrid uses the essence rate, not a separate one.
    expect(r.hybride.per100km).toBeCloseTo(4.5 * 15.2, 5)
    expect(r.electrique.per100km).toBeCloseTo(19.2, 5)
    expect(r.essence.perYear).toBeCloseTo(14820, 5)
  })

  it('makes electric the cheapest with the fallback rates', () => {
    const r = computeAll(inputs)
    const costs = [r.essence.per100km, r.diesel.per100km, r.hybride.per100km, r.electrique.per100km]
    expect(Math.min(...costs)).toBe(r.electrique.per100km)
  })
})

describe('parseEnergyKind', () => {
  it('parses canonical and accented/aliased forms', () => {
    expect(parseEnergyKind('essence')).toBe('essence')
    expect(parseEnergyKind('Diesel')).toBe('diesel')
    expect(parseEnergyKind('hybride')).toBe('hybride')
    expect(parseEnergyKind('phev')).toBe('hybride')
    expect(parseEnergyKind('electrique')).toBe('electrique')
    expect(parseEnergyKind('Électrique')).toBe('electrique')
    expect(parseEnergyKind('electric')).toBe('electrique')
  })

  it('returns null for unknown or empty input', () => {
    expect(parseEnergyKind('gpl')).toBeNull()
    expect(parseEnergyKind('')).toBeNull()
    expect(parseEnergyKind(null)).toBeNull()
    expect(parseEnergyKind(undefined)).toBeNull()
  })
})

describe('fuelTypeToEnergyParam', () => {
  it('maps DB fuel enums to calculator energy kinds', () => {
    expect(fuelTypeToEnergyParam('Essence')).toBe('essence')
    expect(fuelTypeToEnergyParam('Diesel')).toBe('diesel')
    expect(fuelTypeToEnergyParam('Hybrid')).toBe('hybride')
    expect(fuelTypeToEnergyParam('PHEV')).toBe('hybride')
    expect(fuelTypeToEnergyParam('Electric')).toBe('electrique')
  })

  it('returns null for unmodelled or missing fuel types', () => {
    expect(fuelTypeToEnergyParam('GPL')).toBeNull()
    expect(fuelTypeToEnergyParam(null)).toBeNull()
    expect(fuelTypeToEnergyParam(undefined)).toBeNull()
  })
})

describe('FALLBACK_RATES', () => {
  it('has all four stored rate types', () => {
    expect(Object.keys(FALLBACK_RATES).sort()).toEqual(['diesel', 'essence', 'kwh_home', 'kwh_public'])
  })
})
