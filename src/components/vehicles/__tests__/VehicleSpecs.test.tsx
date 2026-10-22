import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VehicleSpecs, KeySpecsStrip } from '../VehicleSpecs'
import type { VehicleNew, FicheTechnique, Variant } from '@/lib/types'

const baseVehicle = { id: 'v1', brand_id: 'b', model_id: 'm' } as unknown as VehicleNew

const fiche = {
  id: 'f1',
  model_id: 'm',
  specs: { 'Puissance dynamique': '235 ch', 'Couple maxi.': '0 Nm', 'Boîte à vitesse': 'Automatique' },
  en_detail: {
    'Confort': ['Climatisation auto', 'Sièges chauffants'],
    'Sécurité': ['6 airbags'],
    'Vide': [],
  },
  source_url: null,
  created_at: '',
  updated_at: '',
} as FicheTechnique

const legacyVehicle = {
  ...baseVehicle,
  fuel_type: 'Hybrid',
  transmission: 'Automatic',
  horsepower: 235,
  fuel_consumption_combined: 4.8,
  dimensions: { length: 4680 },
  vat_deductible: false,
} as unknown as VehicleNew

/** Every rubric is a <details>, and none starts open. */
function expectAllClosedDetails(expectedCount: number) {
  const details = document.querySelectorAll('details')
  expect(details).toHaveLength(expectedCount)
  details.forEach((d) => {
    expect(d.open).toBe(false)
    expect(d.hasAttribute('open')).toBe(false)
    const summary = d.querySelector('summary')!
    expect(summary).toBeTruthy()
    // Explicit affordances: hint text + chevron that rotates when open.
    expect(summary.textContent).toContain('Afficher')
    expect(summary.querySelector('svg.group-open\\:rotate-180')).toBeTruthy()
  })
}

describe('VehicleSpecs — fiche path', () => {
  it('renders specs + each non-empty en_detail category as closed collapsibles', () => {
    render(<VehicleSpecs vehicle={baseVehicle} fiche={fiche} />)
    // 1 specs rubric + Confort + Sécurité (Vide is skipped)
    expectAllClosedDetails(3)
    expect(screen.getByText('CARACTÉRISTIQUES TECHNIQUES')).toBeInTheDocument()
    expect(screen.getByText('CONFORT')).toBeInTheDocument()
    expect(screen.getByText('SÉCURITÉ')).toBeInTheDocument()
    expect(screen.queryByText('VIDE')).not.toBeInTheDocument()
  })

  it('shows the row count and drops placeholder zero values', () => {
    render(<VehicleSpecs vehicle={baseVehicle} fiche={fiche} />)
    // "0 Nm" is filtered → 2 rows in the specs rubric; Confort also has 2
    expect(screen.getAllByText('2 éléments')).toHaveLength(2)
    expect(screen.queryByText('Couple maxi.')).not.toBeInTheDocument()
    expect(screen.getByText('1 élément')).toBeInTheDocument() // Sécurité
  })

  it('"Tout déplier" opens every rubric and flips to "Tout replier"', () => {
    render(<VehicleSpecs vehicle={baseVehicle} fiche={fiche} />)
    fireEvent.click(screen.getByRole('button', { name: /Tout déplier/ }))
    document.querySelectorAll('details').forEach((d) => expect(d.open).toBe(true))
    expect(screen.getByRole('button', { name: /Tout replier/ })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('KeySpecsStrip + VehicleSpecs — one selected version', () => {
  // Sandero Streetway shape: row columns from the 90 ch version, fiche from a 95 ch one.
  const variants: Variant[] = [
    { version: '1.0 TCe 90 Expression', fuel_type: 'Essence', price_min: 128000, price_max: 128000, horsepower: 90, transmission: 'Manual' },
    { version: '1.5 dCi 95 Expression', fuel_type: 'Diesel', price_min: 138000, price_max: 138000, horsepower: 95, transmission: 'Manual' },
    { version: '1.5 dCi 95 Journey', fuel_type: 'Diesel', price_min: 148000, price_max: 148000, horsepower: 95, transmission: 'Manual' },
  ]
  const row = { ...baseVehicle, horsepower: 90, fuel_type: 'Essence', transmission: 'Manual', variant_list: variants } as unknown as VehicleNew
  const sanderoFiche = {
    ...fiche,
    specs: { 'Puissance dynamique': '95 ch', 'Vitesse maxi.': '167.0 km/h', 'Volume de coffre': '410 L', 'Couple maxi.': '0 nm' },
    updated_at: '2026-05-24T22:22:01Z',
  } as FicheTechnique

  const renderBoth = (variant: Variant) =>
    render(
      <>
        <div data-testid="strip"><KeySpecsStrip vehicle={row} fiche={sanderoFiche} variant={variant} variants={variants} /></div>
        <div data-testid="fiche"><VehicleSpecs vehicle={row} fiche={sanderoFiche} variant={variant} variants={variants} basePath="/neuf/dacia/sandero-streetway" /></div>
      </>,
    )

  it('shows the same horsepower in « Points clés » and the fiche for the 95 ch version', () => {
    renderBoth(variants[1])
    const strip = screen.getByTestId('strip')
    const ficheBox = screen.getByTestId('fiche')
    expect(strip).toHaveTextContent('Version : 1.5 dCi 95 Expression')
    expect(strip).toHaveTextContent('95 ch')
    expect(strip).not.toHaveTextContent('90 ch')
    expect(strip).toHaveTextContent('Diesel')
    expect(strip).toHaveTextContent('Manuelle')
    expect(strip).toHaveTextContent('167.0 km/h')
    expect(ficheBox).toHaveTextContent('95 ch')
    expect(ficheBox).toHaveTextContent('Données valables pour : 1.5 dCi 95 Expression, 1.5 dCi 95 Journey.')
    expect(ficheBox).toHaveTextContent('Fiche mise à jour le 24 mai 2026')
  })

  it('reads « Information non disponible » for figures the selected version has no data for', () => {
    renderBoth(variants[1])
    // Couple is a "0 nm" placeholder; Conso. mixte is absent from this fiche.
    expect(screen.getAllByText('Information non disponible')).toHaveLength(2)
  })

  it('does not lend the 95 ch fiche to the 90 ch version and links the versions it describes', () => {
    renderBoth(variants[0])
    const strip = screen.getByTestId('strip')
    const ficheBox = screen.getByTestId('fiche')
    expect(strip).toHaveTextContent('90 ch')
    expect(strip).toHaveTextContent('Essence')
    expect(strip).not.toHaveTextContent('167.0 km/h')
    expect(ficheBox).not.toHaveTextContent('95 ch')
    expect(ficheBox).not.toHaveTextContent('167.0 km/h')
    expect(ficheBox).toHaveTextContent('Fiche détaillée de la version 1.0 TCe 90 Expression : information non disponible.')
    expect(screen.getByRole('link', { name: '1.5 dCi 95 Journey' })).toHaveAttribute(
      'href',
      '/neuf/dacia/sandero-streetway?version=1-5-dci-95-journey#fiche-technique',
    )
  })
})

describe('VehicleSpecs — legacy columns path', () => {
  it('renders each populated category as a closed collapsible', () => {
    render(<VehicleSpecs vehicle={legacyVehicle} fiche={null} />)
    // MOTEUR, CONSOMMATION, DIMENSIONS, GARANTIE (APPARENCE has no data)
    expectAllClosedDetails(4)
    expect(screen.getByText('MOTEUR & PERFORMANCES')).toBeInTheDocument()
    expect(screen.queryByText('APPARENCE')).not.toBeInTheDocument()
  })

  it('still shows the empty state when nothing is populated', () => {
    render(<VehicleSpecs vehicle={baseVehicle} fiche={null} />)
    expect(document.querySelectorAll('details')).toHaveLength(0)
    expect(screen.getByText(/bientôt disponibles/)).toBeInTheDocument()
  })
})
