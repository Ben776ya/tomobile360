/**
 * /neuf catalogue: query params the footer and the home hero send must change
 * what is listed (sort=price-asc, priceMax, hpMin/hpMax).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) => <img {...props} />,
}))

type Row = Record<string, unknown>
let TABLES: Record<string, Row[]> = {}

// Minimal PostgREST stand-in: filters are applied when the query is awaited.
function query(table: string) {
  const preds: Array<(r: Row) => boolean> = []
  const num = (v: unknown) => (typeof v === 'number' ? v : NaN)
  const q = {
    select: () => q,
    order: () => q,
    eq: (c: string, v: unknown) => (preds.push((r) => r[c] === v), q),
    in: (c: string, vs: unknown[]) => (preds.push((r) => vs.includes(r[c])), q),
    gte: (c: string, v: number) => (preds.push((r) => num(r[c]) >= v), q),
    gt: (c: string, v: number) => (preds.push((r) => num(r[c]) > v), q),
    lte: (c: string, v: number) => (preds.push((r) => num(r[c]) <= v), q),
    then: (resolve: (x: { data: Row[] }) => unknown) =>
      resolve({ data: (TABLES[table] ?? []).filter((r) => preds.every((p) => p(r))) }),
  }
  return q
}
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: query }) }))

import NewVehiclesPage from '../page'

function car(model: string, price: number | null, horsepower: number | null): Row {
  return {
    id: `v-${model}`,
    brand_id: 'b1',
    model_id: `m-${model}`,
    version: null,
    year: 2026,
    price_min: price,
    price_max: price,
    fuel_type: 'Essence',
    transmission: 'Manual',
    horsepower,
    images: [],
    variant_list: null,
    is_new_release: false,
    is_popular: false,
    is_available: true,
    created_at: '2026-01-01',
    brands: { name: 'Marque', logo_url: null },
    models: { name: model },
    promotions: [],
  }
}

async function listedModels(searchParams: Record<string, string>) {
  const { container } = render(await NewVehiclesPage({ searchParams }))
  return Array.from(container.querySelectorAll('a'))
    .map((a) => a.getAttribute('href') || '')
    .filter((h) => /^\/neuf\/marque\/[^/?]+$/.test(h))
    .map((h) => h.split('/').pop())
}

describe('/neuf catalogue params', () => {
  beforeEach(() => {
    TABLES = {
      vehicles_new: [
        car('luxe', 0, 500), // "Prix sur demande"
        car('mid', 250000, 100),
        car('cheap', 120000, 75),
        car('inconnu', null, null),
      ],
      brands: [{ id: 'b1', name: 'Marque' }],
      models: [],
    }
  })

  it('sort=price-asc lists cheapest first and "Prix sur demande" last', async () => {
    const order = await listedModels({ sort: 'price-asc' })
    expect(order.slice(0, 2)).toEqual(['cheap', 'mid'])
    expect(order.slice(2).sort()).toEqual(['inconnu', 'luxe'])
  })

  it('a budget cap does not list "Prix sur demande" models', async () => {
    expect(await listedModels({ priceMax: '150000' })).toEqual(['cheap'])
  })

  it('reads the hero horsepower band (hpMin/hpMax)', async () => {
    expect(await listedModels({ hpMin: '91', hpMax: '110' })).toEqual(['mid'])
  })
})
