import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

let search = ''
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}))

import { VehicleFilters } from '../VehicleFilters'

function renderAt(query: string) {
  search = query
  return render(<VehicleFilters brands={[{ id: 'b1', name: 'Dacia' }]} models={[]} categories={[]} />)
}

const sortSelect = () => screen.getAllByRole('combobox')[0] as HTMLSelectElement

describe('VehicleFilters', () => {
  it('shows "Prix croissant" for sort=price-asc (footer "Prix des voitures")', () => {
    renderAt('sort=price-asc')
    expect(sortSelect().value).toBe('price-asc')
  })

  it('shows the order a brand listing actually uses by default (ascending price)', () => {
    renderAt('brand=b1')
    expect(sortSelect().value).toBe('price-asc')
  })

  it('shows the hero horsepower band as removable chips', () => {
    renderAt('hpMin=91&hpMax=110')
    expect(screen.getByRole('button', { name: 'Min 91 ch' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Max 110 ch' })).toBeInTheDocument()
  })
})
