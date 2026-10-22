import type { Variant, VehicleNew } from '@/lib/types'
import { slug } from '@/lib/slug'
import { formatPrice } from '@/lib/utils'
import { isMeaningfulSpecValue } from '@/lib/vehicles/spec-value'
import { fuelLabel, transmissionLabel } from '@/lib/vehicles/display-labels'

/**
 * Per-version spec reader — the ONE place the model page (« Points clés » and
 * the fiche) and the comparator read a version's figures from.
 *
 * Data shape: `vehicles_new` holds one row per model; its `variant_list`
 * carries the per-version facts (name, price, power, fuel, gearbox).
 * Everything else — consumption, top speed, trunk, torque, equipment — sits in
 * `fiches_techniques`: one row per version (`version` = the exact
 * variant_list name) and/or one legacy model-level row (`version` NULL)
 * scraped from a single version the source doesn't name. Reading that legacy
 * row next to the versions unchecked is how the Sandero Streetway showed
 * 90 ch (its first version) next to a fiche saying 95 ch (a dCi version). So a
 * version reads its own row; failing that, a legacy figure is attributed to it
 * only when the legacy row provably describes it; otherwise SPEC_UNAVAILABLE.
 */

/** Shown for any figure we can't tie to the selected version — never 0 or blank. */
export const SPEC_UNAVAILABLE = 'Information non disponible'

/**
 * Any fiche row shape (typed or raw Supabase `Json`); only `specs` and
 * `version` are read. `version` NULL — or absent, before the column exists —
 * marks the legacy model-level fiche.
 */
export type FicheRow = { specs?: unknown; version?: string | null }
type FicheLike = FicheRow | null | undefined

function ficheSpecs(fiche: FicheLike): Record<string, unknown> {
  const specs = fiche?.specs
  return specs && typeof specs === 'object' && !Array.isArray(specs) ? (specs as Record<string, unknown>) : {}
}

export type VehicleSpecColumns = Partial<
  Pick<
    VehicleNew,
    | 'version' | 'price_min' | 'price_max' | 'horsepower' | 'fuel_type' | 'transmission' | 'variant_list'
    | 'fuel_consumption_combined' | 'top_speed' | 'cargo_capacity' | 'torque'
    | 'engine_size' | 'acceleration' | 'co2_emissions' | 'seating_capacity'
  >
>

/** A row's versions: its `variant_list`, or the row itself when the list is empty. */
export function vehicleVariants(vehicle: VehicleSpecColumns): Variant[] {
  return Array.isArray(vehicle.variant_list) && vehicle.variant_list.length > 0
    ? vehicle.variant_list
    : [{
        version: vehicle.version ?? null,
        price_min: vehicle.price_min ?? null,
        price_max: vehicle.price_max ?? null,
        horsepower: vehicle.horsepower ?? null,
        fuel_type: vehicle.fuel_type ?? null,
        transmission: vehicle.transmission ?? null,
      }]
}

/** URL value identifying a version (`?version=` on the model page). */
export function versionSlug(variant: Pick<Variant, 'version'>): string {
  return variant.version ? slug(variant.version) : ''
}

/** Power the fiche states ("95 ch" → 95), or null when it doesn't say. */
export function fichePowerCh(fiche: FicheLike): number | null {
  const raw = ficheSpecs(fiche)['Puissance dynamique']
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Gearbox family from an enum ('Manual') or fiche text ('Manuelle 5 rapports'); null when unclear. */
function gearboxFamily(value: unknown): 'manual' | 'automatic' | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (v.startsWith('manu')) return 'manual'
  if (v.startsWith('auto') || v === 'cvt' || v === 'dct') return 'automatic'
  return null
}

/**
 * Does a single-version source (the fiche, or the row's own columns) describe
 * `variant`? Its power must equal the version's, and its gearbox family too
 * when both state one. A source stating no power can only be tied when every
 * version shares one engine — otherwise there is no telling which it is.
 */
function describes(sourceHp: number | null, sourceGearbox: unknown, variant: Variant, variants: Variant[]): boolean {
  const a = gearboxFamily(sourceGearbox)
  const b = gearboxFamily(variant.transmission)
  if (a && b && a !== b) return false
  if (sourceHp != null) return variant.horsepower === sourceHp
  return variants.every((v) => v.horsepower === variant.horsepower && v.fuel_type === variant.fuel_type)
}

export function ficheDescribesVariant(fiche: FicheLike, variant: Variant, variants: Variant[]): boolean {
  if (!fiche) return false
  // A per-version row describes its own version, by definition.
  if (fiche.version != null) return fiche.version === variant.version
  return describes(fichePowerCh(fiche), ficheSpecs(fiche)['Boîte à vitesse'], variant, variants)
}

/** A version's fiche among its model's rows: its own row, else the model-level one. */
export function ficheForVariant<F extends FicheRow>(fiches: F[] | null | undefined, variant: Pick<Variant, 'version'>): F | null {
  const rows = fiches ?? []
  return (
    rows.find((f) => f.version != null && f.version === variant.version) ??
    rows.find((f) => f.version == null) ??
    null
  )
}

/** Does `variant` have figures from a fiche — its own row, or the model-level one tied to it? */
export function variantHasFiche(fiches: FicheRow[] | null | undefined, variant: Variant, variants: Variant[]): boolean {
  return ficheDescribesVariant(ficheForVariant(fiches, variant), variant, variants)
}

/** Fiche rows grouped by `model_id` (the comparator reads several models at once). */
export function fichesByModel<F extends FicheRow & { model_id: string }>(rows: F[] | null | undefined): Record<string, F[]> {
  const map: Record<string, F[]> = {}
  ;(rows ?? []).forEach((f) => {
    map[f.model_id] = [...(map[f.model_id] ?? []), f]
  })
  return map
}

export function rowDescribesVariant(vehicle: VehicleSpecColumns, variant: Variant, variants: Variant[]): boolean {
  return describes(vehicle.horsepower ?? null, vehicle.transmission, variant, variants)
}

/**
 * The version to show: the one `requested` (a versionSlug) names; else, when
 * versions have their own fiche, the first listed (the « à partir de » one);
 * else the first the model-level fiche describes — so the default view keeps
 * every figure the page has — else the first version.
 */
export function selectVariant(variants: Variant[], fiches: FicheRow[] | null | undefined, requested?: string | null): Variant {
  const perVersion = variants.some((v) => ficheForVariant(fiches, v)?.version != null)
  return (
    (requested ? variants.find((v) => versionSlug(v) === requested) : undefined) ??
    (perVersion ? variants[0] : variants.find((v) => variantHasFiche(fiches, v, variants))) ??
    variants[0]
  )
}

export type VersionSpecKey =
  | 'price' | 'power' | 'fuel' | 'transmission' | 'consumption' | 'topSpeed' | 'trunk' | 'torque'
  | 'engineSize' | 'acceleration' | 'co2' | 'seats' | 'fiscalPower'

/** Display strings for one version; null = unknown for that version. */
export type VersionSpecs = { price: string } & Record<Exclude<VersionSpecKey, 'price'>, string | null>

export const VERSION_SPEC_LABELS: Record<VersionSpecKey, string> = {
  price: 'Prix',
  power: 'Puissance',
  fuel: 'Carburant',
  transmission: 'Boîte',
  consumption: 'Conso. mixte',
  topSpeed: 'Vitesse max',
  trunk: 'Coffre',
  torque: 'Couple',
  engineSize: 'Cylindrée',
  acceleration: '0-100 km/h',
  co2: 'CO2',
  seats: 'Places',
  fiscalPower: 'Puissance fiscale',
}

/** Figures of the model page's « Points clés » strip, in order (the comparator shows them too). */
export const KEY_SPEC_KEYS: VersionSpecKey[] = ['price', 'power', 'fuel', 'transmission', 'consumption', 'topSpeed', 'trunk', 'torque']

export function getVersionSpecs({
  vehicle,
  fiches,
  variant,
  variants,
}: {
  vehicle?: VehicleSpecColumns | null
  /** Every fiche row of the model; the variant's own row wins over the model-level one. */
  fiches?: FicheRow[] | null
  variant: Variant
  variants: Variant[]
}): VersionSpecs {
  const fiche = ficheForVariant(fiches, variant)
  const specs = ficheSpecs(fiche)
  const ficheOk = ficheDescribesVariant(fiche, variant, variants)
  const rowOk = !!vehicle && rowDescribesVariant(vehicle, variant, variants)

  const fromFiche = (...keys: string[]): string | null => {
    if (!ficheOk) return null
    const hit = keys.map((k) => specs[k]).find(isMeaningfulSpecValue)
    return hit == null ? null : String(hit)
  }
  const fromRow = (value: unknown, unit: string): string | null =>
    rowOk && isMeaningfulSpecValue(value) ? `${value}${unit}` : null

  return {
    price: variant.price_min && variant.price_min > 0 ? formatPrice(variant.price_min) : 'Prix sur demande',
    power: variant.horsepower ? `${variant.horsepower} ch` : fromFiche('Puissance dynamique'),
    fuel: variant.fuel_type ? fuelLabel(variant.fuel_type) : null,
    transmission: variant.transmission ? transmissionLabel(variant.transmission) : fromFiche('Boîte à vitesse'),
    consumption: fromFiche('Conso. mixte') ?? fromRow(vehicle?.fuel_consumption_combined, ' L/100km'),
    topSpeed: fromFiche('Vitesse maxi.') ?? fromRow(vehicle?.top_speed, ' km/h'),
    trunk: fromFiche('Volume de coffre') ?? fromRow(vehicle?.cargo_capacity, ' L'),
    torque: fromFiche('Couple maxi.') ?? fromRow(vehicle?.torque, ' Nm'),
    engineSize: fromFiche('Cylindrée') ?? fromRow(vehicle?.engine_size, 'L'),
    acceleration: fromFiche('Accélération 0-100 km/h', 'Accélération 0–100 km/h', 'Accélération') ?? fromRow(vehicle?.acceleration, 's'),
    co2: fromFiche('Emission CO2') ?? fromRow(vehicle?.co2_emissions, ' g/km'),
    seats: fromFiche('Nombre de places') ?? fromRow(vehicle?.seating_capacity, ''),
    fiscalPower: fromFiche('Puissance fiscale'),
  }
}
