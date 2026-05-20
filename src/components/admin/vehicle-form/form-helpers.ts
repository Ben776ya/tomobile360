import type { VehicleNew, Variant } from '@/lib/types'
import type { VehicleFormValues } from './types'

/** Coerce a form-input value (string from <input type="number">) to number | null. */
export function numOrNull(val: string | number | null | undefined): number | null {
  if (val === '' || val === undefined || val === null) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

/** Trim and coerce empty strings to null. */
export function strOrNull(val: string | null | undefined): string | null {
  return val?.trim() ? val.trim() : null
}

/**
 * Build the `defaultValues` for useForm() from the optional existing vehicle.
 * Mirrors the original VehicleForm `useState(vehicle?.x ?? '')` initialisation.
 */
export function buildDefaultValues(
  vehicle: VehicleNew | undefined,
  defaultBrandId: string | undefined,
  defaultModelId: string | undefined
): VehicleFormValues {
  const dims = vehicle?.dimensions as Record<string, number> | null | undefined
  return {
    brand_id: vehicle?.brand_id || defaultBrandId || '',
    model_id: vehicle?.model_id || defaultModelId || '',
    version: vehicle?.version || '',
    year: vehicle?.year || new Date().getFullYear(),

    price_min: vehicle?.price_min ?? '',
    price_max: vehicle?.price_max ?? '',

    fuel_type: vehicle?.fuel_type ?? '',
    transmission: vehicle?.transmission ?? '',
    engine_size: vehicle?.engine_size ?? '',
    cylinders: vehicle?.cylinders ?? '',
    horsepower: vehicle?.horsepower ?? '',
    torque: vehicle?.torque ?? '',
    acceleration: vehicle?.acceleration ?? '',
    top_speed: vehicle?.top_speed ?? '',

    fuel_consumption_city: vehicle?.fuel_consumption_city ?? '',
    fuel_consumption_highway: vehicle?.fuel_consumption_highway ?? '',
    fuel_consumption_combined: vehicle?.fuel_consumption_combined ?? '',
    co2_emissions: vehicle?.co2_emissions ?? '',

    doors: vehicle?.doors ?? '',
    seating_capacity: vehicle?.seating_capacity ?? '',
    cargo_capacity: vehicle?.cargo_capacity ?? '',
    exterior_color: vehicle?.exterior_color ?? '',
    interior_color: vehicle?.interior_color ?? '',

    warranty_months: vehicle?.warranty_months ?? '',
    euro_norm: vehicle?.euro_norm ?? '',
    mileage: vehicle?.mileage ?? '',

    dim_length: dims?.length ?? '',
    dim_width: dims?.width ?? '',
    dim_height: dims?.height ?? '',
    dim_wheelbase: dims?.wheelbase ?? '',

    features: Array.isArray(vehicle?.features) ? vehicle.features : [],
    safety_features: Array.isArray(vehicle?.safety_features) ? vehicle.safety_features : [],

    images: vehicle?.images || [],

    is_available: vehicle?.is_available ?? true,
    is_popular: vehicle?.is_popular ?? false,
    is_new_release: vehicle?.is_new_release ?? false,
    is_coming_soon: vehicle?.is_coming_soon ?? false,
    is_featured_offer: vehicle?.is_featured_offer ?? false,

    coup_de_coeur_reason: vehicle?.coup_de_coeur_reason ?? '',

    variant_list: Array.isArray(vehicle?.variant_list) ? (vehicle!.variant_list as Variant[]) : [],

    promo_percentage: '',
    promo_title: '',
    promo_valid_until: '',
  }
}

/**
 * Convert form values into the payload shape expected by `createVehicle` /
 * `updateVehicle`. `structuredFeatures` is preserved as a fallback when the
 * user's chip-array is empty AND the vehicle was originally imported with a
 * structured features object (CSV import path).
 */
export function buildVehiclePayload(
  values: VehicleFormValues,
  structuredFeatures: Record<string, unknown> | null
) {
  const dimLength = numOrNull(values.dim_length)
  const dimWidth = numOrNull(values.dim_width)
  const dimHeight = numOrNull(values.dim_height)
  const dimWheelbase = numOrNull(values.dim_wheelbase)

  return {
    brand_id: values.brand_id,
    model_id: values.model_id,
    year: Number(values.year),
    version: strOrNull(values.version),
    price_min: numOrNull(values.price_min),
    price_max: numOrNull(values.price_max),
    fuel_type: strOrNull(values.fuel_type),
    transmission: strOrNull(values.transmission),
    engine_size: numOrNull(values.engine_size),
    cylinders: numOrNull(values.cylinders),
    horsepower: numOrNull(values.horsepower),
    torque: numOrNull(values.torque),
    acceleration: numOrNull(values.acceleration),
    top_speed: numOrNull(values.top_speed),
    fuel_consumption_city: numOrNull(values.fuel_consumption_city),
    fuel_consumption_highway: numOrNull(values.fuel_consumption_highway),
    fuel_consumption_combined: numOrNull(values.fuel_consumption_combined),
    co2_emissions: numOrNull(values.co2_emissions),
    doors: numOrNull(values.doors),
    seating_capacity: numOrNull(values.seating_capacity),
    cargo_capacity: numOrNull(values.cargo_capacity),
    exterior_color: strOrNull(values.exterior_color),
    interior_color: strOrNull(values.interior_color),
    warranty_months: numOrNull(values.warranty_months),
    euro_norm: strOrNull(values.euro_norm),
    mileage: numOrNull(values.mileage),
    dimensions:
      dimLength || dimWidth || dimHeight || dimWheelbase
        ? {
            length: dimLength ?? 0,
            width: dimWidth ?? 0,
            height: dimHeight ?? 0,
            wheelbase: dimWheelbase ?? 0,
          }
        : null,
    features: values.features.length > 0 ? values.features : (structuredFeatures ?? []),
    safety_features: values.safety_features,
    images: values.images,
    is_available: values.is_available,
    is_popular: values.is_popular,
    is_new_release: values.is_new_release,
    is_coming_soon: values.is_coming_soon,
    is_featured_offer: values.is_featured_offer,
    coup_de_coeur_reason: strOrNull(values.coup_de_coeur_reason),
    variant_list:
      values.variant_list.length > 0
        ? values.variant_list.map((v) => ({
            version: v.version?.trim() || null,
            price_min: v.price_min ?? null,
            price_max: v.price_max ?? null,
            horsepower: v.horsepower ?? null,
            fuel_type: v.fuel_type || null,
            transmission: v.transmission || null,
          }))
        : null,
  }
}
