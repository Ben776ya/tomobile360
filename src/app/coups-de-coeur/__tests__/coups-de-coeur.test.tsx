import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let rows: Record<string, unknown>[] = []

// Chainable stand-in for the Supabase query builder; awaiting it yields `rows`.
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => {
    const query: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order']) query[m] = () => query
    query.then = (resolve: (r: { data: unknown }) => void) => resolve({ data: rows })
    return { from: () => query }
  },
}))

import CoupsDeCoeurPage from '../page'

const pick = (id: string, category: string, model: string) => ({
  id,
  images: [],
  price_min: 200000,
  price_max: null,
  is_new_release: false,
  is_popular: false,
  is_coup_de_coeur: true,
  coup_de_coeur_category: category,
  version: null,
  year: 2026,
  fuel_type: 'Essence',
  transmission: 'Automatic',
  horsepower: 150,
  brand_id: 'b1',
  model_id: `m-${id}`,
  brands: { name: 'Dacia', logo_url: null },
  models: { name: model },
  promotions: [],
})

async function renderPage(categorie?: string) {
  return render(await CoupsDeCoeurPage({ searchParams: { categorie } }))
}

const tabLabels = () =>
  Array.from(document.querySelectorAll('a'))
    .filter((a) => a.getAttribute('href')?.startsWith('/coups-de-coeur?categorie='))
    .map((a) => a.textContent)

describe('/coups-de-coeur', () => {
  beforeEach(() => {
    rows = []
  })

  it('shows tabs only for segments that have picks and opens the first one', async () => {
    rows = [pick('1', 'suv', 'Duster'), pick('2', 'pickup', 'Tasman')]
    await renderPage()

    expect(tabLabels()).toEqual(['SUV', 'Pick-up'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SUV')
    expect(screen.queryByText(/arrive bientôt/i)).not.toBeInTheDocument()
  })

  it('falls back to a non-empty segment when the requested one is empty', async () => {
    rows = [pick('1', 'suv', 'Duster')]
    await renderPage('voiture')

    expect(tabLabels()).toEqual(['SUV'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SUV')
  })

  it('without any pick, says so and points to the catalogue', async () => {
    await renderPage()

    expect(tabLabels()).toEqual([])
    expect(screen.getByText(/Aucune sélection n'est publiée/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voir le catalogue des voitures neuves/ })).toHaveAttribute('href', '/neuf')
    expect(screen.queryByText(/arrive bientôt|prochainement/i)).not.toBeInTheDocument()
  })
})
