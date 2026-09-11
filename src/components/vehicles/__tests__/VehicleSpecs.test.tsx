import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VehicleSpecs } from '../VehicleSpecs'
import type { VehicleNew, FicheTechnique } from '@/lib/types'

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
