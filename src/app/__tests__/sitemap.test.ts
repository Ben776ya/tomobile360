import { describe, it, expect, vi } from 'vitest'

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
    then: (resolve: (x: { data: Row[] }) => unknown) =>
      resolve({ data: (TABLES[table] ?? []).filter((r) => preds.every((p) => p(r))) }),
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
})
