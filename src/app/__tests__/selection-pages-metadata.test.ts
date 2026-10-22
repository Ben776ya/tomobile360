import { describe, it, expect, vi, beforeEach } from 'vitest'

type Row = Record<string, unknown>
let vehicles: Row[] = []

// Chainable stand-in for the Supabase query builder: awaiting it yields the
// rows matching every .eq() filter, and their count.
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => {
      const preds: Array<(r: Row) => boolean> = []
      const q = {
        select: () => q,
        eq: (c: string, v: unknown) => (preds.push((r) => r[c] === v), q),
        then: (resolve: (x: { data: Row[]; count: number }) => unknown) => {
          const rows = vehicles.filter((r) => preds.every((p) => p(r)))
          return resolve({ data: rows, count: rows.length })
        },
      }
      return q
    },
  }),
}))

import { generateMetadata as promotionsMetadata } from '../neuf/promotions/page'
import { generateMetadata as populairesMetadata } from '../neuf/populaires/page'
import { generateMetadata as coupsDeCoeurMetadata } from '../coups-de-coeur/page'

const PAGES = [
  ['/neuf/promotions', promotionsMetadata, 'is_featured_offer'],
  ['/neuf/populaires', populairesMetadata, 'is_popular'],
  ['/coups-de-coeur', coupsDeCoeurMetadata, 'is_coup_de_coeur'],
] as const

describe('editorial selection pages: noindex while empty', () => {
  beforeEach(() => {
    vehicles = []
  })

  it.each(PAGES)('%s is noindex when no available vehicle is flagged', async (path, generateMetadata, flag) => {
    vehicles = [{ is_available: false, [flag]: true }]
    const metadata = await generateMetadata()
    expect(metadata.robots).toEqual({ index: false })
    expect(metadata.alternates?.canonical).toBe(path)
  })

  it.each(PAGES)('%s is indexable again once an available vehicle is flagged', async (path, generateMetadata, flag) => {
    vehicles = [{ is_available: true, [flag]: true }]
    const metadata = await generateMetadata()
    expect(metadata.robots).toBeUndefined()
    expect(metadata.alternates?.canonical).toBe(path)
  })
})
