import { formatPrice } from '@/lib/utils'
import { transmissionLabel } from '@/lib/vehicles/display-labels'

/**
 * A single question/answer pair. This same array feeds BOTH the visible FAQ
 * block and the FAQPage JSON-LD on the model page — one source of truth, so the
 * rendered text and the structured data can never drift apart.
 */
export interface ModelFaqItem {
  question: string
  answer: string
}

export interface ModelFaqInput {
  brandName: string
  modelName: string
  /** Cheapest variant price (MAD), or null / 0 when "prix sur demande". */
  minPrice: number | null
  /** Highest variant price (MAD), used only to phrase a range. */
  maxPrice: number | null
  /** Combined-cycle consumption in L/100 km, or null / 0 when unknown. */
  consumptionCombined: number | null
  /** Fiscal power string already extracted from the fiche (e.g. "8 CV"), or null. */
  fiscalPower: string | null
  /** Raw transmission enum values (e.g. ["Manual", "Automatic"]). */
  transmissions: string[]
  /** Number of versions from `variant_list`. */
  versionCount: number
}

/**
 * Build the model page's FAQ from data only. Every entry is gated on a real,
 * non-zero value — matching {@link isMeaningfulSpecValue} — so no question ever
 * renders with "0 DH", "undefined", or an empty answer. Returns [] when nothing
 * qualifies, in which case the page renders neither the block nor the JSON-LD.
 */
export function buildModelFaq(input: ModelFaqInput): ModelFaqItem[] {
  const {
    brandName,
    modelName,
    minPrice,
    maxPrice,
    consumptionCombined,
    fiscalPower,
    transmissions,
    versionCount,
  } = input

  const car = `${brandName} ${modelName}`
  const items: ModelFaqItem[] = []

  // 1) Price — only with a real starting price.
  if (minPrice && minPrice > 0) {
    const answer =
      maxPrice && maxPrice > minPrice
        ? `Le ${car} est disponible au Maroc à partir de ${formatPrice(minPrice)}, jusqu'à ${formatPrice(maxPrice)} selon la version.`
        : `Le ${car} est disponible au Maroc à partir de ${formatPrice(minPrice)}.`
    items.push({ question: `Quel est le prix du ${car} au Maroc ?`, answer })
  }

  // 2) Versions — only when there is genuine choice (2+).
  if (versionCount >= 2) {
    items.push({
      question: `Combien de versions du ${car} sont disponibles au Maroc ?`,
      answer: `Le ${car} est proposé en ${versionCount} versions au Maroc.`,
    })
  }

  // 3) Combined consumption — only when > 0.
  if (consumptionCombined && consumptionCombined > 0) {
    items.push({
      question: `Quelle est la consommation du ${car} ?`,
      answer: `Le ${car} affiche une consommation mixte de ${consumptionCombined} L/100 km.`,
    })
  }

  // 4) Fiscal power — only when the fiche carries a real value.
  const fiscal = fiscalPower?.trim()
  if (fiscal) {
    items.push({
      question: `Quelle est la puissance fiscale du ${car} ?`,
      answer: `La puissance fiscale du ${car} est de ${fiscal}.`,
    })
  }

  // 5) Transmission — only when at least one is known.
  const transLabels = transmissions
    .map((t) => transmissionLabel(t).toLowerCase())
    .filter(Boolean)
  if (transLabels.length > 0) {
    const joined =
      transLabels.length > 1
        ? `${transLabels.slice(0, -1).join(', ')} ou ${transLabels[transLabels.length - 1]}`
        : transLabels[0]
    items.push({
      question: `Quelle boîte de vitesses équipe le ${car} ?`,
      answer: `Le ${car} est disponible avec une boîte ${joined}.`,
    })
  }

  return items
}
