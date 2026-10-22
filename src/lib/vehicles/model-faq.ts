import { formatPrice } from '@/lib/utils'
import type { VersionSpecs } from '@/lib/vehicles/version-specs'

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
  /** The version `specs` describes (the one the page displays), named in the answers; null when the model has one. */
  versionName: string | null
  /** That version's figures from getVersionSpecs — the page's reader; null = unknown, never quoted. */
  specs: Pick<VersionSpecs, 'consumption' | 'fiscalPower' | 'transmission'>
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
    versionName,
    specs,
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

  // 3–5) The displayed version's figures, from the page's reader: named when
  // the model has several versions, and only when the reader knows them.
  const forVersion = (sentence: string) =>
    versionName ? `En version ${versionName}, ${sentence}` : sentence.charAt(0).toUpperCase() + sentence.slice(1)

  if (specs.consumption) {
    items.push({
      question: `Quelle est la consommation du ${car} ?`,
      answer: forVersion(`le ${car} affiche une consommation mixte de ${specs.consumption}.`),
    })
  }

  if (specs.fiscalPower) {
    items.push({
      question: `Quelle est la puissance fiscale du ${car} ?`,
      answer: forVersion(`la puissance fiscale du ${car} est de ${specs.fiscalPower}.`),
    })
  }

  if (specs.transmission) {
    items.push({
      question: `Quelle boîte de vitesses équipe le ${car} ?`,
      answer: forVersion(`le ${car} est équipé d'une boîte ${specs.transmission.toLowerCase()}.`),
    })
  }

  return items
}
