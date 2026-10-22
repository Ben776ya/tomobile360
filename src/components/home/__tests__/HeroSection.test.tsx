import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/components/home/HeroSlider', () => ({ HeroSlider: () => null }))
vi.mock('@/lib/supabase/client', () => {
  const q: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'gte', 'gt', 'lte']) q[m] = () => q
  q.then = (resolve: (x: { count: number }) => unknown) => resolve({ count: 0 })
  return { createClient: () => ({ from: () => q }) }
})

import { HeroSection } from '../HeroSection'
import { PRICE_RANGES } from '@/components/vehicles/VehicleFilters'

const budgetSelect = () =>
  screen.getAllByRole('combobox').find((s) => s.querySelector('option')?.textContent === 'BUDGET') as HTMLSelectElement

function submittedParams() {
  fireEvent.click(screen.getByRole('button', { name: /Rechercher/ }))
  const url = push.mock.calls[push.mock.calls.length - 1][0] as string
  expect(url.startsWith('/neuf?')).toBe(true)
  return new URL(url, 'https://www.tomobile360.ma').searchParams
}

describe('HeroSection budget', () => {
  beforeEach(() => push.mockClear())

  it('offers the catalogue brackets', () => {
    render(<HeroSection brands={[]} />)
    const labels = Array.from(budgetSelect().options).map((o) => o.textContent)
    expect(labels).toEqual(['BUDGET', ...PRICE_RANGES.map((r) => r.label)])
  })

  it('submits each bracket as the priceMin/priceMax the catalogue reads', () => {
    render(<HeroSection brands={[]} />)
    const select = budgetSelect()
    const options = Array.from(select.options).slice(1)
    options.forEach((option, i) => {
      fireEvent.change(select, { target: { value: option.value } })
      const params = submittedParams()
      expect(params.get('priceMin') ?? undefined).toBe(PRICE_RANGES[i].min)
      expect(params.get('priceMax') ?? undefined).toBe(PRICE_RANGES[i].max)
    })
  })

  it('accepts a typed max budget, narrowing any bracket', () => {
    render(<HeroSection brands={[]} />)
    const input = screen.getByRole('spinbutton', { name: 'Budget maximum en DH' })
    fireEvent.change(input, { target: { value: '180000' } })
    expect(submittedParams().get('priceMax')).toBe('180000')

    fireEvent.change(budgetSelect(), { target: { value: '0-150000' } })
    expect(submittedParams().get('priceMax')).toBe('150000')
  })

  it('explains "puissance fiscale" and "VUL"', () => {
    render(<HeroSection brands={[]} />)
    expect(screen.getByText(/CV fiscaux, base de la vignette/)).toBeInTheDocument()
    expect(screen.getByText(/véhicule utilitaire léger/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'VUL' })).toHaveAttribute('title', 'Véhicule utilitaire léger')
  })
})
