import { describe, it, expect, vi, afterEach } from 'vitest'

type Row = Record<string, unknown>
const TABLES: Record<string, Row[]> = {
  blog_posts: [],
  vehicles_new: [],
  models: [],
  vehicles_used: [],
  videos: [
    { id: 'aaaaaaaa-0000-4000-8000-000000000001', created_at: '2026-10-01T09:00:00', is_published: true },
    { id: 'aaaaaaaa-0000-4000-8000-000000000002', created_at: '2026-09-01T09:00:00', is_published: false },
  ],
}

function query(table: string) {
  const preds: Array<(r: Row) => boolean> = []
  const q = {
    select: () => q,
    order: () => q,
    limit: () => q,
    eq: (c: string, v: unknown) => (preds.push((r) => r[c] === v), q),
    then: (resolve: (x: { data: Row[]; count: number }) => unknown) => {
      const rows = (TABLES[table] ?? []).filter((r) => preds.every((p) => p(r)))
      return resolve({ data: rows, count: rows.length })
    },
  }
  return q
}
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: query }) }))

import sitemap from '../sitemap'

describe('sitemap', () => {
  it('lists each published video page at its canonical URL', async () => {
    const entries = await sitemap()
    const videos = entries.filter((e) => e.url.includes('/videos/'))
    expect(videos.map((e) => e.url)).toEqual([
      'https://www.tomobile360.ma/videos/aaaaaaaa-0000-4000-8000-000000000001',
    ])
    expect(videos[0].lastModified).toEqual(new Date('2026-10-01T09:00:00'))
  })

  describe('editorial selections', () => {
    afterEach(() => {
      TABLES.vehicles_new = []
    })
    const SELECTIONS = ['/neuf/promotions', '/neuf/populaires', '/coups-de-coeur'].map((p) => `https://www.tomobile360.ma${p}`)
    const listed = async () => (await sitemap()).map((e) => e.url).filter((u) => SELECTIONS.includes(u))

    it('leaves out every selection page that has no available vehicle', async () => {
      TABLES.vehicles_new = [
        // Flagged but no longer available: does not count.
        { model_id: 'm1', is_available: false, is_featured_offer: true, is_popular: true, is_coup_de_coeur: true },
      ]
      expect(await listed()).toEqual([])
    })

    it('lists a selection page again as soon as one available vehicle is flagged', async () => {
      TABLES.vehicles_new = [
        { model_id: 'm1', is_available: true, is_featured_offer: false, is_popular: true, is_coup_de_coeur: false },
      ]
      expect(await listed()).toEqual(['https://www.tomobile360.ma/neuf/populaires'])
    })
  })
})
