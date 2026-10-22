import { describe, it, expect } from 'vitest'
import type { MoccazListing } from '@/lib/scrapers/moccaz'
import {
  filterMoccazListings,
  normalizeTransmission,
  parseAmount,
  parseMoccazFilters,
  toSearchParams,
} from '../moccaz-filters'

// Values copied from the live M-OCCAZ feed (2026-10-22).
function listing(slug: string, over: Partial<MoccazListing>): MoccazListing {
  return {
    title: 'DACIA SANDERO',
    subtitle: '',
    year: '2022',
    power: '6 Cv',
    mileage: '50 000 km',
    gearbox: 'Manuelle',
    fuel: 'Diesel',
    price: '100 000,00 Dhs',
    slug,
    url: `https://m-occaz.ma/annonce/${slug}`,
    image: null,
    ...over,
  }
}

const feed: MoccazListing[] = [
  listing('sandero-cheap', { price: '78 000,00 Dhs', mileage: '92 253 km', gearbox: 'Manuelle', fuel: 'Diesel' }),
  listing('sandero-80k', { price: '80 000,00 Dhs', mileage: '30 114 km', gearbox: 'Manuelle', fuel: 'Essence' }),
  listing('logan-auto', { title: 'DACIA LOGAN', price: '125 000,00 Dhs', mileage: '82 020 km', gearbox: 'Automatique', fuel: 'Essence' }),
  listing('stepway-auto', { price: '145 000,00 Dhs', mileage: '10 km', gearbox: 'Automatique', fuel: 'Essence' }),
  listing('austral-no-fuel', { title: 'RENAULT AUSTRAL', price: '285 000,00 Dhs', mileage: '21 888 km', gearbox: 'Manuelle', fuel: '' }),
  listing('arkana-auto', { title: 'RENAULT ARKANA', price: '75 000,00 Dhs', mileage: '41 987 km', gearbox: 'Automatique', fuel: 'Hybride' }),
  listing('no-price', { price: '', mileage: '', gearbox: '' }),
]

const slugs = (l: MoccazListing[]) => l.map((x) => x.slug)

describe('parseAmount', () => {
  it('reads feed prices and mileages', () => {
    expect(parseAmount('221 000,00 Dhs')).toBe(221000)
    expect(parseAmount('108 093 km')).toBe(108093)
    expect(parseAmount('10 km')).toBe(10)
    expect(parseAmount('125 000,00 Dhs')).toBe(125000)
  })

  it('returns null when there is no number', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('Prix sur demande')).toBeNull()
  })
})

describe('normalizeTransmission', () => {
  it('maps French, English and case variants', () => {
    expect(normalizeTransmission('Automatique')).toBe('automatic')
    expect(normalizeTransmission('automatic')).toBe('automatic')
    expect(normalizeTransmission('AUTOMATIC')).toBe('automatic')
    expect(normalizeTransmission('Manuelle')).toBe('manual')
    expect(normalizeTransmission('Manual')).toBe('manual')
  })

  it('returns null for unknown values', () => {
    expect(normalizeTransmission('')).toBeNull()
    expect(normalizeTransmission('CVT')).toBeNull()
  })
})

describe('parseMoccazFilters', () => {
  it('reads every quick-filter param', () => {
    expect(
      parseMoccazFilters({ priceMax: '80000', transmission: 'Automatic', mileageMax: '50000', fuel: 'Diesel', brand: 'Dacia' })
    ).toEqual({ priceMax: 80000, transmission: 'automatic', mileageMax: 50000, fuel: 'Diesel', brand: 'Dacia' })
  })

  it('ignores empty, invalid and unsupported params', () => {
    expect(parseMoccazFilters({ priceMax: 'abc', mileageMax: '0', transmission: 'x', city: 'Casablanca', fuel: '' })).toEqual({})
  })

  it('takes the first value of a repeated param', () => {
    expect(parseMoccazFilters({ fuel: ['Diesel', 'Essence'] })).toEqual({ fuel: 'Diesel' })
  })
})

describe('filterMoccazListings', () => {
  it('returns everything without filters', () => {
    expect(filterMoccazListings(feed, {})).toHaveLength(feed.length)
  })

  it('price cap keeps only prices <= cap and drops unknown prices', () => {
    const result = filterMoccazListings(feed, { priceMax: 80000 })
    expect(slugs(result)).toEqual(['sandero-cheap', 'sandero-80k', 'arkana-auto'])
    for (const l of result) expect(parseAmount(l.price)!).toBeLessThanOrEqual(80000)
  })

  it('automatic keeps no manual gearbox and drops unknown gearboxes', () => {
    const result = filterMoccazListings(feed, { transmission: 'automatic' })
    expect(slugs(result)).toEqual(['logan-auto', 'stepway-auto', 'arkana-auto'])
  })

  it('manual keeps only manual gearboxes', () => {
    const result = filterMoccazListings(feed, { transmission: 'manual' })
    expect(slugs(result)).toEqual(['sandero-cheap', 'sandero-80k', 'austral-no-fuel'])
  })

  it('mileage cap keeps only mileage <= cap and drops unknown mileage', () => {
    const result = filterMoccazListings(feed, { mileageMax: 50000 })
    expect(slugs(result)).toEqual(['sandero-80k', 'stepway-auto', 'austral-no-fuel', 'arkana-auto'])
  })

  it('fuel filter drops listings with no fuel', () => {
    expect(slugs(filterMoccazListings(feed, { fuel: 'essence' }))).toEqual(['sandero-80k', 'logan-auto', 'stepway-auto'])
  })

  it('combines criteria (AND)', () => {
    expect(slugs(filterMoccazListings(feed, { priceMax: 80000, transmission: 'automatic' }))).toEqual(['arkana-auto'])
    expect(
      slugs(filterMoccazListings(feed, { priceMax: 150000, transmission: 'automatic', mileageMax: 50000, brand: 'dacia' }))
    ).toEqual(['stepway-auto'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterMoccazListings(feed, { priceMax: 80000, fuel: 'Hybride', transmission: 'manual' })).toEqual([])
  })
})

describe('toSearchParams', () => {
  it('round-trips the active filters', () => {
    const filters = parseMoccazFilters({ priceMax: '80000', transmission: 'Automatique', mileageMax: '50000' })
    const qs = toSearchParams(filters).toString()
    expect(qs).toBe('priceMax=80000&transmission=Automatic&mileageMax=50000')
    expect(parseMoccazFilters(Object.fromEntries(new URLSearchParams(qs)))).toEqual(filters)
  })
})
