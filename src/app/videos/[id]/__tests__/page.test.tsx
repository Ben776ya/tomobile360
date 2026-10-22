import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CONSENT_STORAGE_KEY } from '@/lib/analytics/consent'

const VIDEO = {
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  title: 'Essai Dacia Duster',
  description: null,
  video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  category: null,
  vehicle_id: null,
  duration: null,
  views: 10,
  created_at: '2026-10-01T09:00:00Z',
  is_published: true,
}

// Chainable stand-in for the Supabase query builder: .single() yields the
// video, awaiting the list query yields no related videos.
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'neq', 'order', 'limit']) q[m] = () => q
    q.single = async () => ({ data: VIDEO })
    q.then = (resolve: (r: { data: unknown[] }) => void) => resolve({ data: [] })
    return { from: () => q, rpc: async () => ({}) }
  },
}))

import VideoDetailPage from '../page'

async function renderPage() {
  return render(await VideoDetailPage({ params: { id: VIDEO.id } }))
}

describe('/videos/[id] player', () => {
  afterEach(() => localStorage.clear())

  it('loads no YouTube iframe before consent, then the privacy-enhanced player on « Charger la vidéo »', async () => {
    const { container } = await renderPage()
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByRole('link', { name: /Voir sur YouTube/ })).toHaveAttribute('href', VIDEO.video_url)

    fireEvent.click(screen.getByRole('button', { name: 'Charger la vidéo' }))
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('loads the privacy-enhanced player with the page once cookies are accepted', async () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    const { container } = await renderPage()
    expect(container.querySelector('iframe')!.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })
})
