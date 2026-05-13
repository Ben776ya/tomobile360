import type { ModelGroup } from '@/components/vehicles/ModelCard'

/**
 * Minimum shape `buildModelGroups` accepts. Callers' Supabase queries should
 * select at least these columns. `promotions` is optional — when absent,
 * `hasPromo` defaults to false.
 */
export interface VehicleRowForGrouping {
  id: string
  brand_id: string
  model_id: string
  version: string | null
  year: number | null
  price_min: number | null
  price_max: number | null
  fuel_type: string | null
  transmission: string | null
  images: string[] | null
  is_new_release: boolean | null
  is_popular: boolean | null
  brands: { name: string; logo_url: string | null } | { name: string; logo_url: string | null }[] | null
  models: { name: string } | { name: string }[] | null
  promotions?: { discount_percentage: number | null; is_active?: boolean }[] | null
}

/**
 * Group `vehicles_new` rows by `model_id` and produce one `ModelGroup` per model.
 * Rows are expected to be sorted by `price_min` ascending so index 0 is the
 * cheapest representative version.
 */
export function buildModelGroups(rows: VehicleRowForGrouping[]): ModelGroup[] {
  const modelMap: Record<string, VehicleRowForGrouping[]> = {}
  for (const v of rows) {
    if (!modelMap[v.model_id]) modelMap[v.model_id] = []
    modelMap[v.model_id].push(v)
  }

  const modelGroups: ModelGroup[] = []
  for (const key of Object.keys(modelMap)) {
    const groupVehicles = modelMap[key]
    const representative = groupVehicles[0]

    const brandsRaw = representative.brands
    const brandData = (Array.isArray(brandsRaw) ? brandsRaw[0] : brandsRaw) ?? null
    const modelsRaw = representative.models
    const modelData = (Array.isArray(modelsRaw) ? modelsRaw[0] : modelsRaw) ?? null

    if (!brandData || !modelData) continue

    const prices = groupVehicles
      .map(v => v.price_min)
      .filter((p): p is number => p !== null)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null

    const maxPrices = groupVehicles
      .map(v => v.price_max ?? v.price_min)
      .filter((p): p is number => p !== null)
    const maxPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : null

    const fuelSet: Record<string, boolean> = {}
    const transSet: Record<string, boolean> = {}
    for (const v of groupVehicles) {
      if (v.fuel_type) fuelSet[v.fuel_type] = true
      if (v.transmission) transSet[v.transmission] = true
    }

    const hasPromo = groupVehicles.some(v =>
      v.promotions?.some(
        p => p.discount_percentage && p.discount_percentage > 0 && p.is_active !== false
      )
    )

    modelGroups.push({
      brandId: representative.brand_id,
      brandName: brandData.name,
      brandLogo: brandData.logo_url,
      modelId: representative.model_id,
      modelName: modelData.name,
      minPrice,
      maxPrice,
      mainImage: representative.images?.[0] || '/placeholder-car.svg',
      versionCount: groupVehicles.length,
      fuelTypes: Object.keys(fuelSet),
      transmissions: Object.keys(transSet),
      hasNewRelease: groupVehicles.some(v => !!v.is_new_release),
      hasPopular: groupVehicles.some(v => !!v.is_popular),
      hasPromo,
      vehicleId: representative.id,
    })
  }

  return modelGroups
}
