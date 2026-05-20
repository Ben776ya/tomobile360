import type { Variant } from '@/lib/types'

/**
 * Form-state shape consumed by useForm<VehicleFormValues>().
 *
 * NUMERIC FIELDS are typed as `string | number` because the form binds them
 * to <Input type="number" />; the browser supplies a `string` while typing,
 * and the field is converted to `number | null` at submit time via
 * `numOrNull()`. Keeping the union (rather than forcing `number`) preserves
 * the existing UX where a user can clear a field to "empty" without it
 * snapping to 0.
 *
 * STRING SELECT FIELDS (fuel_type, transmission, euro_norm) use plain
 * `string`; the empty string `''` represents "no value" and is converted
 * to `null` at submit time.
 *
 * `dimensions` and `variant_list` are kept flat in the form so each input
 * registers cleanly; they're re-assembled in the submit handler.
 */
export interface VehicleFormValues {
  // Basic info
  brand_id: string
  model_id: string
  version: string
  year: number

  // Pricing
  price_min: string | number
  price_max: string | number

  // Engine
  fuel_type: string
  transmission: string
  engine_size: string | number
  cylinders: string | number
  horsepower: string | number
  torque: string | number
  acceleration: string | number
  top_speed: string | number

  // Efficiency
  fuel_consumption_city: string | number
  fuel_consumption_highway: string | number
  fuel_consumption_combined: string | number
  co2_emissions: string | number

  // Body
  doors: string | number
  seating_capacity: string | number
  cargo_capacity: string | number
  exterior_color: string
  interior_color: string

  // Additional
  warranty_months: string | number
  euro_norm: string
  mileage: string | number

  // Dimensions (flat for clean RHF binding)
  dim_length: string | number
  dim_width: string | number
  dim_height: string | number
  dim_wheelbase: string | number

  // Features
  features: string[]
  safety_features: string[]

  // Images
  images: string[]

  // Flags
  is_available: boolean
  is_popular: boolean
  is_new_release: boolean
  is_coming_soon: boolean
  is_featured_offer: boolean

  // Coup de Cœur
  coup_de_coeur_reason: string

  // Variants
  variant_list: Variant[]

  // Promotion (create-mode only)
  promo_percentage: string
  promo_title: string
  promo_valid_until: string
}
