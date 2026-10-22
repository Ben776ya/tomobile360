import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

// Real rows (2026-10-21), trimmed to what the comparator reads. Neither row
// carries consumption / trunk / top speed in its columns — only the fiche does.
const tables: Record<string, Record<string, unknown>[]> = {
  vehicles_new: [
    {
      id: 'sandero', model_id: 'm-sandero', year: 2025, version: '1.0 TCe 90 Expression',
      horsepower: 90, fuel_type: 'Essence', transmission: 'Manual', price_min: 128000,
      top_speed: null, cargo_capacity: null, fuel_consumption_combined: null, images: [],
      brands: { name: 'Dacia', logo_url: null }, models: { name: 'Sandero Streetway', category: 'Citadine' },
      variant_list: [
        { version: '1.0 TCe 90 Expression', fuel_type: 'Essence', price_min: 128000, price_max: 128000, horsepower: 90, transmission: 'Manual' },
        { version: '1.5 dCi 95 Expression', fuel_type: 'Diesel', price_min: 138000, price_max: 138000, horsepower: 95, transmission: 'Manual' },
      ],
    },
    {
      id: 'duster', model_id: 'm-duster', year: 2025, version: '1.5 dCi 115 4x2 Expression',
      horsepower: 115, fuel_type: 'Diesel', transmission: 'Manual', price_min: 202000, images: [],
      brands: { name: 'Dacia', logo_url: null }, models: { name: 'Duster', category: 'SUV' },
      variant_list: [
        { version: '1.5 dCi 115 4x2 Expression', fuel_type: 'Diesel', price_min: 202000, price_max: 202000, horsepower: 115, transmission: 'Manual' },
      ],
    },
  ],
  fiches_techniques: [
    { model_id: 'm-sandero', specs: { 'Puissance dynamique': '95 ch', 'Conso. mixte': '5.5 L/100km', 'Volume de coffre': '410 L', 'Vitesse maxi.': '167.0 km/h', 'Couple maxi.': '0 nm' } },
    // The Duster fiche describes a 150 ch engine that isn't in its version list.
    { model_id: 'm-duster', specs: { 'Puissance dynamique': '150 ch', 'Vitesse maxi.': '174 km/h', 'Volume de coffre': '542 litre' } },
  ],
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        in: (column: string, values: string[]) =>
          Promise.resolve({ data: tables[table].filter((r) => values.includes(r[column] as string)) }),
      }),
    }),
  }),
}))

import { ComparisonTable } from '../ComparisonTable'

const row = (label: string) => screen.getByText(label, { selector: 'td' }).closest('tr')!

describe('ComparisonTable — same source as the model page', () => {
  it('fills consumption, trunk and top speed from the fiche for the version it describes', async () => {
    render(<ComparisonTable vehicleIds={['sandero', 'duster']} />)
    await screen.findByText('Caractéristiques')
    // Sandero defaults to the version its fiche describes, like the model page.
    expect(row('Version')).toHaveTextContent('1.5 dCi 95 Expression')
    expect(row('Conso. mixte')).toHaveTextContent('5.5 L/100km')
    expect(row('Coffre')).toHaveTextContent('410 L')
    expect(row('Vitesse max')).toHaveTextContent('167.0 km/h')
    expect(row('Puissance')).toHaveTextContent('95 ch')
    // The Duster fiche matches none of its versions: unknown, never 0 or blank.
    const vmaxCells = within(row('Vitesse max')).getAllByRole('cell')
    expect(vmaxCells[2]).toHaveTextContent('Information non disponible')
    expect(row('Vitesse max')).not.toHaveTextContent('174')
  })

  it('shows French gearbox / fuel labels, never the raw enum', async () => {
    render(<ComparisonTable vehicleIds={['sandero', 'duster']} />)
    await screen.findByText('Caractéristiques')
    expect(row('Boîte')).toHaveTextContent('Manuelle')
    expect(row('Carburant')).toHaveTextContent('Diesel')
    expect(screen.queryByText('Manual')).toBeNull()
  })

  it('honours the requested version per column and links back to it', async () => {
    render(<ComparisonTable vehicleIds={['sandero', 'duster']} versions={['1-0-tce-90-expression', null]} />)
    await screen.findByText('Caractéristiques')
    expect(row('Version')).toHaveTextContent('1.0 TCe 90 Expression')
    expect(row('Puissance')).toHaveTextContent('90 ch')
    expect(row('Conso. mixte')).not.toHaveTextContent('5.5')
    expect(screen.getByRole('link', { name: 'Dacia Sandero Streetway' })).toHaveAttribute(
      'href',
      '/neuf/dacia/sandero-streetway?version=1-0-tce-90-expression',
    )
  })

  it('highlights rows whose known values differ', async () => {
    render(<ComparisonTable vehicleIds={['sandero', 'duster']} />)
    await screen.findByText('Caractéristiques')
    expect(within(row('Puissance')).getByText('95 ch')).toHaveClass('text-secondary')
    // Both Manuelle → no highlight.
    expect(within(row('Boîte')).getAllByText('Manuelle')[0]).not.toHaveClass('text-secondary')
  })
})
