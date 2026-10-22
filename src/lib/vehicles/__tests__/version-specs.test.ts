import { describe, it, expect } from 'vitest'
import type { Variant } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import {
  SPEC_UNAVAILABLE,
  fichePowerCh,
  ficheDescribesVariant,
  getVersionSpecs,
  selectVariant,
  vehicleVariants,
  versionSlug,
} from '../version-specs'

// Real Dacia Sandero Streetway data (vehicles_new 9592d0da…, fiches_techniques
// b811f6df…) as of 2026-10-21: the row's columns are the first version's
// (90 ch), the model-level fiche was scraped from a 95 ch dCi version.
const sandero: Variant[] = [
  { version: '1.0 TCe 90 Expression', fuel_type: 'Essence', price_min: 128000, price_max: 128000, horsepower: 90, transmission: 'Manual' },
  { version: '1.5 dCi 95 Expression', fuel_type: 'Diesel', price_min: 138000, price_max: 138000, horsepower: 95, transmission: 'Manual' },
  { version: '1.5 dCi 95 Journey', fuel_type: 'Diesel', price_min: 148000, price_max: 148000, horsepower: 95, transmission: 'Manual' },
  { version: '1.5 dCi 95 Extreme', fuel_type: 'Diesel', price_min: 162000, price_max: 162000, horsepower: 95, transmission: 'Manual' },
]
const sanderoRow = {
  version: '1.0 TCe 90 Expression', horsepower: 90, fuel_type: 'Essence', transmission: 'Manual',
  top_speed: null, cargo_capacity: null, fuel_consumption_combined: null, torque: null,
  variant_list: sandero,
}
const sanderoFiche = {
  specs: {
    'Conso. mixte': '5.5 L/100km',
    'Conso. route': '0.0 L/100km',
    'Couple maxi.': '0 nm',
    'Vitesse maxi.': '167.0 km/h',
    'Volume de coffre': '410 L',
    'Puissance fiscale': '5 cv',
    'Puissance dynamique': '95 ch',
  },
}

describe('fiche ↔ version matching', () => {
  it('reads the power the fiche states', () => {
    expect(fichePowerCh(sanderoFiche)).toBe(95)
    expect(fichePowerCh({ specs: {} })).toBeNull()
    expect(fichePowerCh(null)).toBeNull()
  })

  it('ties the Sandero fiche to the 95 ch versions only', () => {
    expect(sandero.map((v) => ficheDescribesVariant(sanderoFiche, v, sandero))).toEqual([false, true, true, true])
  })

  it('also requires the gearbox family to match when the fiche states one', () => {
    const variants: Variant[] = [
      { ...sandero[1], version: 'dCi 115 Journey', horsepower: 115, transmission: 'Manual' },
      { ...sandero[1], version: 'dCi 115 Summit', horsepower: 115, transmission: 'Automatic' },
    ]
    const fiche = { specs: { 'Puissance dynamique': '115 ch', 'Boîte à vitesse': 'Manuelle 6 rapports' } }
    expect(variants.map((v) => ficheDescribesVariant(fiche, v, variants))).toEqual([true, false])
  })

  it('ties a fiche without stated power only when every version shares one engine', () => {
    const fiche = { specs: { 'Vitesse maxi.': '180 km/h' } }
    const oneEngine = [sandero[1], sandero[2]]
    expect(oneEngine.every((v) => ficheDescribesVariant(fiche, v, oneEngine))).toBe(true)
    expect(sandero.some((v) => ficheDescribesVariant(fiche, v, sandero))).toBe(false)
  })

  it('ties nothing when the fiche power matches no listed version (Duster case)', () => {
    const duster: Variant[] = [{ ...sandero[1], version: '1.5 dCi 115 4x2 Expression', horsepower: 115 }]
    const fiche = { specs: { 'Puissance dynamique': '150 ch', 'Motorisation': '1.3 TCe 150 EDC7' } }
    expect(ficheDescribesVariant(fiche, duster[0], duster)).toBe(false)
  })
})

describe('selectVariant', () => {
  it('defaults to the first version the fiche describes', () => {
    expect(selectVariant(sandero, sanderoFiche).version).toBe('1.5 dCi 95 Expression')
  })

  it('honours ?version= and ignores an unknown slug', () => {
    expect(selectVariant(sandero, sanderoFiche, '1-0-tce-90-expression').version).toBe('1.0 TCe 90 Expression')
    expect(selectVariant(sandero, sanderoFiche, 'nope').version).toBe('1.5 dCi 95 Expression')
  })

  it('falls back to the first version when the fiche describes none', () => {
    expect(selectVariant(sandero, null).version).toBe('1.0 TCe 90 Expression')
  })

  it('slugs version names for the URL', () => {
    expect(versionSlug(sandero[1])).toBe('1-5-dci-95-expression')
    expect(versionSlug({ version: null })).toBe('')
  })
})

describe('getVersionSpecs — one reader for every view', () => {
  it('gives the 95 ch version its own price/fuel/power/gearbox and the fiche figures', () => {
    const s = getVersionSpecs({ vehicle: sanderoRow, fiche: sanderoFiche, variant: sandero[1], variants: sandero })
    expect(s.price).toBe(formatPrice(138000))
    expect(s.power).toBe('95 ch')
    expect(s.fuel).toBe('Diesel')
    expect(s.transmission).toBe('Manuelle')
    expect(s.consumption).toBe('5.5 L/100km')
    expect(s.topSpeed).toBe('167.0 km/h')
    expect(s.trunk).toBe('410 L')
    // "0 nm" is a placeholder, and the row's columns describe the 90 ch version.
    expect(s.torque).toBeNull()
  })

  it('never lends the 95 ch fiche figures to the 90 ch version', () => {
    const s = getVersionSpecs({ vehicle: sanderoRow, fiche: sanderoFiche, variant: sandero[0], variants: sandero })
    expect(s.power).toBe('90 ch')
    expect(s.fuel).toBe('Essence')
    expect(s.consumption).toBeNull()
    expect(s.topSpeed).toBeNull()
    expect(s.trunk).toBeNull()
  })

  it('reads the row columns only for the version the row describes', () => {
    const row = { ...sanderoRow, top_speed: 170, cargo_capacity: 0 }
    expect(getVersionSpecs({ vehicle: row, fiche: null, variant: sandero[0], variants: sandero }).topSpeed).toBe('170 km/h')
    expect(getVersionSpecs({ vehicle: row, fiche: null, variant: sandero[0], variants: sandero }).trunk).toBeNull()
    expect(getVersionSpecs({ vehicle: row, fiche: null, variant: sandero[1], variants: sandero }).topSpeed).toBeNull()
  })

  it('reads "Prix sur demande" without a price and exposes the unknown label', () => {
    const s = getVersionSpecs({ fiche: null, variant: { ...sandero[0], price_min: null }, variants: sandero })
    expect(s.price).toBe('Prix sur demande')
    expect(SPEC_UNAVAILABLE).toBe('Information non disponible')
  })

  it('builds the versions from the row when variant_list is empty', () => {
    const vs = vehicleVariants({ ...sanderoRow, variant_list: [], price_min: 128000, price_max: 128000 })
    expect(vs).toEqual([{ version: '1.0 TCe 90 Expression', price_min: 128000, price_max: 128000, horsepower: 90, fuel_type: 'Essence', transmission: 'Manual' }])
    expect(vehicleVariants(sanderoRow)).toBe(sandero)
  })
})
