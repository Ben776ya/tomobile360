import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const push = vi.fn()
// Filter calls of each count query, newest last.
const countQueries = vi.hoisted(() => [] as Array<Array<[string, string, unknown]>>)
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/components/home/HeroSlider', () => ({ HeroSlider: () => null }))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => {
      const calls: Array<[string, string, unknown]> = []
      countQueries.push(calls)
      const q: Record<string, unknown> = {}
      for (const m of ['select', 'eq', 'gte', 'gt', 'lte']) {
        q[m] = (column: string, value: unknown) => {
          calls.push([m, column, value])
          return q
        }
      }
      q.then = (resolve: (x: { count: number }) => unknown) => resolve({ count: 0 })
      return q
    },
  }),
}))

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

  it('counts and searches with the same price bounds when bracket, slider and typed max overlap', async () => {
    render(<HeroSection brands={[]} />)
    const [sliderMin, sliderMax] = screen.getAllByRole('slider')
    const input = screen.getByRole('spinbutton', { name: 'Budget maximum en DH' })

    // Each case: the most restrictive min and max win, whichever control sets them.
    const cases: Array<{ budget: string; slider: [string, string]; typed: string; min: string | null; max: string | null }> = [
      { budget: '250000-350000', slider: ['100000', '300000'], typed: '', min: '250000', max: '300000' },
      { budget: '150000-250000', slider: ['200000', '1000000'], typed: '', min: '200000', max: '250000' },
      { budget: '500000+', slider: ['0', '800000'], typed: '700000', min: '500000', max: '700000' },
      { budget: '', slider: ['0', '1000000'], typed: '', min: null, max: null },
    ]
    for (const c of cases) {
      fireEvent.change(budgetSelect(), { target: { value: c.budget } })
      fireEvent.change(sliderMax, { target: { value: c.slider[1] } })
      fireEvent.change(sliderMin, { target: { value: c.slider[0] } })
      fireEvent.change(input, { target: { value: c.typed } })

      // The debounced count query once these values are applied.
      const before = countQueries.length
      await waitFor(() => expect(countQueries.length).toBeGreaterThan(before))
      const calls = countQueries[countQueries.length - 1]
      const gte = calls.filter(([m, col]) => m === 'gte' && col === 'price_min').map(([, , v]) => Number(v))
      const lte = calls.filter(([m, col]) => m === 'lte' && col === 'price_min').map(([, , v]) => Number(v))
      const countMin = gte.length ? String(Math.max(...gte)) : null
      const countMax = lte.length ? String(Math.min(...lte)) : null

      const params = submittedParams()
      expect([countMin, countMax]).toEqual([c.min, c.max])
      expect([params.get('priceMin'), params.get('priceMax')]).toEqual([c.min, c.max])
    }
  })

  it('explains "puissance fiscale" and "VUL"', () => {
    render(<HeroSection brands={[]} />)
    expect(screen.getByText(/CV fiscaux, base de la vignette/)).toBeInTheDocument()
    expect(screen.getByText(/véhicule utilitaire léger/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'VUL' })).toHaveAttribute('title', 'Véhicule utilitaire léger')
  })
})
