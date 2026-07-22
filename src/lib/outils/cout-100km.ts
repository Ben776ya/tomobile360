/**
 * Pure cost model for the "Combien coûte 100 km" calculator
 * (/outils/cout-100km). No I/O — unit-testable.
 *
 * A rate is a price in Moroccan dirhams per unit: DH per litre for fuels, DH per
 * kWh for electricity. Cost per 100 km = consumption × rate; annual cost scales
 * that by the yearly distance. Hybrids burn petrol, so they use the essence
 * rate at a lower consumption.
 */

/** Rate keys as stored in the `energy_rates` table. */
export type RateType = 'essence' | 'diesel' | 'kwh_home' | 'kwh_public'

/** The four energy options compared side by side in the UI. */
export type EnergyKind = 'essence' | 'diesel' | 'hybride' | 'electrique'

/** DH per unit, keyed by stored rate type. */
export type EnergyRates = Record<RateType, number>

export const ENERGY_KINDS: readonly EnergyKind[] = ['essence', 'diesel', 'hybride', 'electrique']

export const ENERGY_KIND_LABELS: Record<EnergyKind, string> = {
  essence: 'Essence',
  diesel: 'Diesel',
  hybride: 'Hybride',
  electrique: 'Électrique',
}

/** Consumption unit per energy kind (L/100km for fuels, kWh/100km for electric). */
export const ENERGY_KIND_UNITS: Record<EnergyKind, string> = {
  essence: 'L/100km',
  diesel: 'L/100km',
  hybride: 'L/100km',
  electrique: 'kWh/100km',
}

/**
 * Default rates, mirrored in migrations/seed-energy-rates.sql. Used when the
 * energy_rates table is absent or empty. Keep AS_OF and the values in sync with
 * the seed.
 *
 * essence / diesel / kwh_home are operator-confirmed Moroccan prices (replacing
 * the original launch placeholders). kwh_public remains an unconfirmed estimate.
 */
export const FALLBACK_RATES_AS_OF = '2026-07-22'
export const FALLBACK_RATES: EnergyRates = {
  essence: 13.8,
  diesel: 12.8,
  kwh_home: 1.17,
  kwh_public: 4.0,
}

/** Sensible per-segment consumption pre-fills (editable by the user). */
export const SEGMENT_DEFAULTS: Record<EnergyKind, number> = {
  essence: 6.5,
  diesel: 5.0,
  hybride: 4.5,
  electrique: 16,
}

export const DEFAULT_ANNUAL_KM = 15000

/** Which kWh rate feeds the électrique column. */
export type ElectricSource = 'home' | 'public'

export interface CalcInputs {
  /** Consumption per energy kind: L/100km for fuels, kWh/100km for electric. */
  consumption: Record<EnergyKind, number>
  /** Effective per-unit prices in DH. */
  rates: {
    essence: number
    diesel: number
    /** The kWh price feeding the électrique column (home or public). */
    kwh: number
  }
  annualKm: number
}

export interface KindCost {
  per100km: number
  perYear: number
}

export type CalcResult = Record<EnergyKind, KindCost>

/** DH to cover 100 km. consumption × price-per-unit. */
export function costPer100km(consumption: number, ratePerUnit: number): number {
  if (!isFinite(consumption) || !isFinite(ratePerUnit) || consumption < 0 || ratePerUnit < 0) return 0
  return consumption * ratePerUnit
}

/** DH per year for a given per-100km cost and yearly distance. */
export function annualCost(per100km: number, annualKm: number): number {
  if (!isFinite(per100km) || !isFinite(annualKm) || annualKm < 0) return 0
  return per100km * (annualKm / 100)
}

/** Compute per-100km and annual cost for all four energy kinds. */
export function computeAll(inputs: CalcInputs): CalcResult {
  const { consumption, rates, annualKm } = inputs
  // Hybrids burn petrol → essence rate. Electric → the chosen kWh rate.
  const rateFor: Record<EnergyKind, number> = {
    essence: rates.essence,
    diesel: rates.diesel,
    hybride: rates.essence,
    electrique: rates.kwh,
  }
  const result = {} as CalcResult
  for (const kind of ENERGY_KINDS) {
    const per100km = costPer100km(consumption[kind], rateFor[kind])
    result[kind] = { per100km, perYear: annualCost(per100km, annualKm) }
  }
  return result
}

/** Parse a deep-link `energie` query param into an EnergyKind (accent-tolerant). */
export function parseEnergyKind(value: string | null | undefined): EnergyKind | null {
  if (!value) return null
  const v = value.trim().toLowerCase()
  if (v === 'essence') return 'essence'
  if (v === 'diesel') return 'diesel'
  if (v === 'hybride' || v === 'hybrid' || v === 'phev') return 'hybride'
  if (v === 'electrique' || v === 'électrique' || v === 'electric' || v === 'ev') return 'electrique'
  return null
}

/**
 * Map a DB fuel_type enum (Essence/Diesel/Hybrid/PHEV/Electric) to the
 * calculator's `energie` param, for model-page deep links. Returns null for
 * fuel types the calculator does not model as a distinct column.
 */
export function fuelTypeToEnergyParam(fuelType: string | null | undefined): EnergyKind | null {
  switch (fuelType) {
    case 'Essence':
      return 'essence'
    case 'Diesel':
      return 'diesel'
    case 'Hybrid':
    case 'PHEV':
      return 'hybride'
    case 'Electric':
      return 'electrique'
    default:
      return null
  }
}
