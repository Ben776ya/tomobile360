import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push }),
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) => <img {...props} />,
}))
vi.mock('@/components/shared/FloatingSocialBubble', () => ({ FloatingSocialBubble: () => null }))

const ARTICLES = { data: [] as unknown[] }
const VIDEOS = { data: [] as unknown[] }
const videoFilters: string[] = []
const supabase = {
  from: (table: string) => {
    const chain = {
      select: () => chain,
      eq: (col: string, val: unknown) => {
        if (table === 'videos') videoFilters.push(`${col}=${val}`)
        return chain
      },
      or: () => chain,
      limit: async () => (table === 'videos' ? VIDEOS : ARTICLES),
    }
    return chain
  },
}
vi.mock('@/lib/supabase/client', () => ({ createClient: () => supabase }))

import Header from '../Header'

const VIDEO = {
  id: '5f0c6a3e-1111-4222-8333-944455556666',
  title: 'Dacia Duster vs Bigster',
  thumbnail_url: null,
  category: 'comparison',
  duration: '12:00',
}

async function search(input: HTMLElement, q: string) {
  fireEvent.change(input, { target: { value: q } })
  await act(async () => {
    vi.advanceTimersByTime(350)
  })
}

describe('Header search', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    push.mockClear()
    videoFilters.length = 0
    ARTICLES.data = []
    VIDEOS.data = [VIDEO]
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('says it covers articles and videos', () => {
    render(<Header />)
    const input = screen.getByRole('textbox', { name: 'Rechercher dans les articles et les vidéos' })
    expect(input).toHaveAttribute('placeholder', 'Rechercher articles et vidéos')
  })

  it('links each video result to its own page, and only searches published videos', async () => {
    render(<Header />)
    await search(screen.getByRole('textbox'), 'Dacia')
    const link = screen.getByRole('link', { name: /Dacia Duster vs Bigster/ })
    expect(link).toHaveAttribute('href', `/videos/${VIDEO.id}`)
    expect(videoFilters).toContain('is_published=true')
  })

  it('Enter opens the first result instead of an unfiltered list', async () => {
    render(<Header />)
    const input = screen.getByRole('textbox')
    await search(input, 'Dacia')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(push).toHaveBeenCalledWith(`/videos/${VIDEO.id}`)
  })

  it('Enter does nothing when there is no result', async () => {
    VIDEOS.data = []
    render(<Header />)
    const input = screen.getByRole('textbox')
    await search(input, 'zzz')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(push).not.toHaveBeenCalled()
  })

  it('mobile search links videos to their own page too', async () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    const inputs = screen.getAllByRole('textbox', { name: 'Rechercher dans les articles et les vidéos' })
    expect(inputs).toHaveLength(2)
    await search(inputs[1], 'Dacia')
    const hrefs = screen
      .getAllByRole('link', { name: /Dacia Duster vs Bigster/ })
      .map((a) => a.getAttribute('href'))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((h) => h === `/videos/${VIDEO.id}`)).toBe(true)
  })
})
