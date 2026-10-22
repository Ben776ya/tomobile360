import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// The tiles never query Supabase on render; the panels' children are out of scope.
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/components/vehicles/VehicleSelector', () => ({ VehicleSelector: () => null }))
vi.mock('@/components/vehicles/ComparisonTable', () => ({ ComparisonTable: () => null }))

import { FeatureGrid } from '../FeatureGrid'

const hrefs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'))

describe('FeatureGrid', () => {
  it('hides the offres, populaires and coups de cœur highlights while they are empty', () => {
    const { container } = render(<FeatureGrid hasOffers={false} hasPopular={false} hasCoupsDeCoeur={false} />)

    expect(screen.getByText('Comparateur')).toBeInTheDocument()
    expect(screen.getByText('Voitures chinoises')).toBeInTheDocument()
    expect(screen.queryByText('Offres Spéciales')).not.toBeInTheDocument()
    expect(screen.queryByText('Modèles populaires')).not.toBeInTheDocument()
    expect(screen.queryByText('Coups de Cœur')).not.toBeInTheDocument()

    const links = hrefs(container)
    expect(links).not.toContain('/neuf/promotions')
    expect(links).not.toContain('/neuf/populaires')
    expect(links).not.toContain('/coups-de-coeur')
    // Two tiles can't fill a looping 3-per-view carousel without a repeat.
    expect(container.querySelector('[aria-roledescription="carousel"]')).toBeNull()
    expect(screen.getAllByText('Comparateur')).toHaveLength(1)
  })

  it('shows each highlight once its page has content', () => {
    const { container } = render(<FeatureGrid hasOffers hasPopular hasCoupsDeCoeur />)

    expect(container.querySelector('[aria-roledescription="carousel"]')).not.toBeNull()
    const links = hrefs(container)
    expect(links).toContain('/neuf/promotions')
    expect(links).toContain('/neuf/populaires')
    expect(links).toContain('/coups-de-coeur')
  })

  it('presents populaires as an editorial selection, not sales', () => {
    render(<FeatureGrid hasOffers={false} hasPopular hasCoupsDeCoeur={false} />)

    expect(screen.getAllByText('Modèles populaires').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sélection de la rédaction').length).toBeGreaterThan(0)
    expect(screen.queryByText(/top ventes/i)).not.toBeInTheDocument()
  })
})
