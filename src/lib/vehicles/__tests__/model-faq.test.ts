import { describe, it, expect } from 'vitest'
import type { Variant } from '@/lib/types'
import { buildModelFaq } from '../model-faq'
import { getVersionSpecs, selectVariant } from '../version-specs'

// Sandero Streetway (2026-10-21): legacy fiche scraped from a dCi 95 version.
const sandero: Variant[] = [
  { version: '1.0 TCe 90 Expression', fuel_type: 'Essence', price_min: 128000, price_max: 128000, horsepower: 90, transmission: 'Manual' },
  { version: '1.5 dCi 95 Expression', fuel_type: 'Diesel', price_min: 138000, price_max: 138000, horsepower: 95, transmission: 'Manual' },
  { version: '1.5 dCi 95 Journey', fuel_type: 'Diesel', price_min: 148000, price_max: 148000, horsepower: 95, transmission: 'Manual' },
  { version: '1.5 dCi 95 Extreme', fuel_type: 'Diesel', price_min: 162000, price_max: 162000, horsepower: 95, transmission: 'Manual' },
]
const row = { horsepower: 90, fuel_type: 'Essence', transmission: 'Manual', fuel_consumption_combined: null, variant_list: sandero }
const legacy = { specs: { 'Conso. mixte': '5.5 L/100km', 'Puissance fiscale': '5 cv', 'Puissance dynamique': '95 ch' } }
const journeyRow = { version: '1.5 dCi 95 Journey', specs: { 'Conso. mixte': '4.4 L/100km', 'Puissance fiscale': '5 cv' } }

/** What the model page does: FAQ figures = the displayed version's, via the page's reader. */
function pageFaq(fiches: object[], requested?: string) {
  const variant = selectVariant(sandero, fiches, requested)
  return buildModelFaq({
    brandName: 'Dacia',
    modelName: 'Sandero Streetway',
    minPrice: 128000,
    maxPrice: 162000,
    versionName: variant.version,
    specs: getVersionSpecs({ vehicle: row, fiches, variant, variants: sandero }),
    versionCount: sandero.length,
  })
}
const answer = (items: { question: string; answer: string }[], q: RegExp) => items.find((i) => q.test(i.question))?.answer

describe('buildModelFaq — figures of the displayed version', () => {
  it('names the displayed version and states its figures (default view, legacy fiche)', () => {
    const faq = pageFaq([legacy])
    expect(answer(faq, /consommation/)).toBe('En version 1.5 dCi 95 Expression, le Dacia Sandero Streetway affiche une consommation mixte de 5.5 L/100km.')
    expect(answer(faq, /puissance fiscale/)).toBe('En version 1.5 dCi 95 Expression, la puissance fiscale du Dacia Sandero Streetway est de 5 cv.')
    expect(answer(faq, /boîte/)).toBe("En version 1.5 dCi 95 Expression, le Dacia Sandero Streetway est équipé d'une boîte manuelle.")
  })

  it('never quotes a figure the reader marks unknown for that version', () => {
    // TCe 90: the legacy fiche is a dCi's, so consumption and fiscal power are unknown.
    const faq = pageFaq([legacy], '1-0-tce-90-expression')
    expect(answer(faq, /consommation/)).toBeUndefined()
    expect(answer(faq, /puissance fiscale/)).toBeUndefined()
    expect(answer(faq, /boîte/)).toBe("En version 1.0 TCe 90 Expression, le Dacia Sandero Streetway est équipé d'une boîte manuelle.")
    expect(JSON.stringify(faq)).not.toMatch(/5\.5|5 cv/)
  })

  it("reads a version's own fiche row when there is one", () => {
    const faq = pageFaq([legacy, journeyRow], '1-5-dci-95-journey')
    expect(answer(faq, /consommation/)).toBe('En version 1.5 dCi 95 Journey, le Dacia Sandero Streetway affiche une consommation mixte de 4.4 L/100km.')
  })

  it('keeps the model-level price and version count, and names no version for a single-version model', () => {
    const faq = buildModelFaq({
      brandName: 'Dacia',
      modelName: 'Duster',
      minPrice: 202000,
      maxPrice: 202000,
      versionName: null,
      specs: { consumption: '5.1 L/100km', fiscalPower: null, transmission: 'Manuelle' },
      versionCount: 1,
    })
    expect(faq.map((i) => i.answer)).toEqual([
      'Le Dacia Duster est disponible au Maroc à partir de 202.000 DH.',
      'Le Dacia Duster affiche une consommation mixte de 5.1 L/100km.',
      "Le Dacia Duster est équipé d'une boîte manuelle.",
    ])
    expect(pageFaq([legacy])[1].answer).toBe('Le Dacia Sandero Streetway est proposé en 4 versions au Maroc.')
  })
})
