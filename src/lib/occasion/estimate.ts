export const CONDITION_MULTIPLIERS: Record<string, number> = {
  'Excellent': 1.1,
  'Très Bon': 1.0,
  'Bon': 0.9,
  'Acceptable': 0.75,
}

export type EstimateInput = {
  year: number
  mileage: number
  condition: string
  currentYear: number
  /** Asking prices of similar used listings (same model, year ±2). */
  similarPrices: number[]
  /** The model's new-car catalogue price ("à partir de"), null when unknown. */
  cataloguePrice: number | null
}

export type UsedPriceEstimate = {
  min: number
  max: number
  average: number
  basis: { kind: 'listings'; count: number } | { kind: 'catalogue'; price: number }
}

/**
 * Indicative asking-price range for a used car. Uses similar listings when
 * there are any, otherwise depreciates the model's catalogue price.
 * Returns null when neither reference exists for the model.
 */
export function estimateUsedPrice(input: EstimateInput): UsedPriceEstimate | null {
  const prices = input.similarPrices.filter((p) => p > 0)
  if (prices.length > 0) {
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      basis: { kind: 'listings', count: prices.length },
    }
  }

  const basePrice = input.cataloguePrice
  if (!basePrice || basePrice <= 0) return null

  const vehicleAge = input.currentYear - input.year

  // Depreciation by year (15% per year for first 5 years, 10% after)
  const depreciation = Math.pow(0.85, Math.min(vehicleAge, 5)) * Math.pow(0.9, Math.max(vehicleAge - 5, 0))

  // Depreciation by mileage (reduce price by 1% per 10,000 km)
  const mileageDepreciation = Math.max(0, 1 - input.mileage / 1000000)

  const conditionMultiplier = CONDITION_MULTIPLIERS[input.condition] || 1.0

  const estimatedPrice = basePrice * depreciation * mileageDepreciation * conditionMultiplier

  // A used car is never worth more than new: « Excellent » (×1.1) on a nearly
  // new car would otherwise land above the catalogue price.
  return {
    min: Math.round(estimatedPrice * 0.85),
    max: Math.min(Math.round(estimatedPrice * 1.15), basePrice),
    average: Math.min(Math.round(estimatedPrice), basePrice),
    basis: { kind: 'catalogue', price: basePrice },
  }
}
