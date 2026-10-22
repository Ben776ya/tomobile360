import type { MoccazListing } from '@/lib/scrapers/moccaz'

export type Transmission = 'automatic' | 'manual'

/** Filters supported on /occasion. Only fields the M-OCCAZ feed carries. */
export type MoccazFilters = {
  brand?: string
  fuel?: string
  priceMax?: number
  transmission?: Transmission
  mileageMax?: number
}

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

function positiveNumber(value: string): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** "221 000,00 Dhs" → 221000, "108 093 km" → 108093, "" → null. */
export function parseAmount(text: string): number | null {
  const digits = text.split(',')[0].replace(/\D/g, '')
  return digits ? Number(digits) : null
}

/** Feed says "Automatique"/"Manuelle"; links say "Automatic"/"Manual". */
export function normalizeTransmission(text: string): Transmission | null {
  const t = text.trim().toLowerCase()
  if (t.startsWith('auto')) return 'automatic'
  if (t.startsWith('manu')) return 'manual'
  return null
}

export function parseMoccazFilters(params: RawParams): MoccazFilters {
  const filters: MoccazFilters = {}
  const brand = first(params.brand)
  const fuel = first(params.fuel)
  const priceMax = positiveNumber(first(params.priceMax))
  const transmission = normalizeTransmission(first(params.transmission))
  const mileageMax = positiveNumber(first(params.mileageMax))

  if (brand) filters.brand = brand
  if (fuel) filters.fuel = fuel
  if (priceMax !== undefined) filters.priceMax = priceMax
  if (transmission) filters.transmission = transmission
  if (mileageMax !== undefined) filters.mileageMax = mileageMax
  return filters
}

/**
 * Keep listings matching every active filter. A listing whose value for an
 * active filter is missing or unreadable does not match.
 */
export function filterMoccazListings(
  listings: MoccazListing[],
  filters: MoccazFilters
): MoccazListing[] {
  return listings.filter((l) => {
    if (filters.brand && !l.title.toLowerCase().includes(filters.brand.toLowerCase())) return false
    if (filters.fuel && !l.fuel.toLowerCase().includes(filters.fuel.toLowerCase())) return false
    if (filters.priceMax !== undefined) {
      const price = parseAmount(l.price)
      if (price === null || price > filters.priceMax) return false
    }
    if (filters.transmission && normalizeTransmission(l.gearbox) !== filters.transmission) return false
    if (filters.mileageMax !== undefined) {
      const km = parseAmount(l.mileage)
      if (km === null || km > filters.mileageMax) return false
    }
    return true
  })
}

/** Query string for the active filters, so links can add/remove one and keep the rest. */
export function toSearchParams(filters: MoccazFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.fuel) params.set('fuel', filters.fuel)
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax))
  if (filters.transmission) params.set('transmission', filters.transmission === 'automatic' ? 'Automatic' : 'Manual')
  if (filters.mileageMax !== undefined) params.set('mileageMax', String(filters.mileageMax))
  return params
}
