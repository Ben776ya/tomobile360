import 'server-only'

import { createClient } from '@/lib/supabase/server'
import {
  FALLBACK_RATES,
  FALLBACK_RATES_AS_OF,
  type EnergyRates,
  type RateType,
} from '@/lib/outils/cout-100km'

const ENERGY_RATES_COLUMNS = 'rate_type, value_dh, effective_date, source, is_active'

const RATE_TYPES: RateType[] = ['essence', 'diesel', 'kwh_home', 'kwh_public']

export interface EnergyRatesResult {
  /** Current DH-per-unit prices, keyed by rate type. */
  rates: EnergyRates
  /** ISO date (YYYY-MM-DD) the shown prices took effect. */
  effectiveDate: string
  /** True when the energy_rates table was absent/empty and code defaults were used. */
  isFallback: boolean
}

/**
 * Read current energy prices from the `energy_rates` table, newest effective_date
 * per type. Degrades gracefully: if the table does not exist yet, errors, or is
 * empty, returns the dated code fallback and logs a warning — so the calculator
 * works before the migration is applied.
 */
export async function getEnergyRates(): Promise<EnergyRatesResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('energy_rates')
    .select(ENERGY_RATES_COLUMNS)
    .eq('is_active', true)
    .order('effective_date', { ascending: false })

  if (error) {
    console.warn(
      `[energy-rates] table read failed (${error.message}); using ${FALLBACK_RATES_AS_OF} fallback rates.`,
    )
    return { rates: { ...FALLBACK_RATES }, effectiveDate: FALLBACK_RATES_AS_OF, isFallback: true }
  }

  if (!data || data.length === 0) {
    console.warn(`[energy-rates] table empty; using ${FALLBACK_RATES_AS_OF} fallback rates.`)
    return { rates: { ...FALLBACK_RATES }, effectiveDate: FALLBACK_RATES_AS_OF, isFallback: true }
  }

  // Rows arrive newest-first, so the first row seen for each rate_type holds the
  // current price. Unknown/missing types keep their code-fallback value.
  const rates: EnergyRates = { ...FALLBACK_RATES }
  const seen = new Set<RateType>()
  let latestDate = ''
  for (const row of data) {
    const type = row.rate_type as RateType
    if (!RATE_TYPES.includes(type) || seen.has(type)) continue
    rates[type] = Number(row.value_dh)
    seen.add(type)
    if (row.effective_date > latestDate) latestDate = row.effective_date
  }

  const missing = RATE_TYPES.filter((t) => !seen.has(t))
  if (missing.length > 0) {
    console.warn(
      `[energy-rates] missing rate type(s) [${missing.join(', ')}]; using fallback for those.`,
    )
  }

  return {
    rates,
    effectiveDate: latestDate || FALLBACK_RATES_AS_OF,
    isFallback: false,
  }
}
