import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LoopCarousel } from '../LoopCarousel'

const TITLES = ['A', 'B', 'C', 'D', 'E']

// happy-dom doesn't evaluate media queries reliably; pin per-view to 3 (md+).
function mockPerView(perView: 1 | 2 | 3) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: (query.includes('768') && perView === 3) || (query.includes('640') && perView >= 2),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

function renderCarousel(titles = TITLES) {
  const utils = render(
    <LoopCarousel label="Services" prevLabel="Précédent" nextLabel="Suivant">
      {titles.map((t) => (
        <button key={t} type="button">
          {t}
        </button>
      ))}
    </LoopCarousel>,
  )
  const track = utils.container.querySelector('[data-carousel-viewport] > div') as HTMLElement
  const slides = () => Array.from(track.children) as HTMLElement[]
  const loopIndex = () => Number(track.style.getPropertyValue('--loop-index'))
  // Titles of the slides that are not hidden (= the visible window).
  const shown = () => slides().filter((s) => !s.hasAttribute('aria-hidden')).map((s) => s.textContent)
  return { ...utils, track, slides, loopIndex, shown }
}

describe('LoopCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPerView(3)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders a labelled carousel region with 3 clones on each side', () => {
    const { slides } = renderCarousel()
    expect(screen.getByRole('region', { name: 'Services' })).toHaveAttribute('aria-roledescription', 'carousel')
    expect(slides().map((s) => s.textContent)).toEqual(['C', 'D', 'E', 'A', 'B', 'C', 'D', 'E', 'A', 'B', 'C'])
    expect(slides()[3]).toHaveAttribute('aria-label', '1 sur 5')
  })

  it('shows the first 3 slides and makes every other slide inert and aria-hidden', () => {
    const { slides, shown } = renderCarousel()
    expect(shown()).toEqual(['A', 'B', 'C'])
    slides().forEach((s, i) => {
      const visible = i >= 3 && i < 6
      expect(s.inert).toBe(!visible)
      expect(s.getAttribute('aria-hidden')).toBe(visible ? null : 'true')
    })
  })

  it('loops forward endlessly: 5 nexts walk every window and land back on the start', () => {
    const { loopIndex, shown } = renderCarousel()
    const next = screen.getByRole('button', { name: 'Suivant' })
    const windows: string[][] = []
    for (let i = 0; i < 5; i++) {
      fireEvent.click(next)
      act(() => {
        vi.advanceTimersByTime(450)
      })
      windows.push(shown() as string[])
    }
    expect(windows).toEqual([
      ['B', 'C', 'D'],
      ['C', 'D', 'E'],
      ['D', 'E', 'A'],
      ['E', 'A', 'B'],
      ['A', 'B', 'C'],
    ])
    // Jumped back from the trailing clones to the real first slide.
    expect(loopIndex()).toBe(3)
  })

  it('loops backward: previous from the start shows the last slide first, then jumps to the real one', () => {
    const { loopIndex, shown } = renderCarousel()
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }))
    expect(loopIndex()).toBe(2) // on the leading clone of E
    expect(shown()).toEqual(['E', 'A', 'B'])
    act(() => {
      vi.advanceTimersByTime(450)
    })
    expect(loopIndex()).toBe(7) // real E
    expect(shown()).toEqual(['E', 'A', 'B'])
  })

  it('never runs past the clones during a burst of clicks', () => {
    const { loopIndex, shown } = renderCarousel()
    const next = screen.getByRole('button', { name: 'Suivant' })
    for (let i = 0; i < 9; i++) fireEvent.click(next)
    expect(loopIndex()).toBe(8) // bounded at n + clones
    act(() => {
      vi.advanceTimersByTime(450)
    })
    expect(loopIndex()).toBe(3)
    expect(shown()).toEqual(['A', 'B', 'C'])
  })

  it('swipes on touch', () => {
    const { container, shown } = renderCarousel()
    const viewport = container.querySelector('[data-carousel-viewport]')!
    fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 10 }] })
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 120, clientY: 14 }] })
    expect(shown()).toEqual(['B', 'C', 'D'])
    // Mostly vertical gesture: ignored (page scroll).
    fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 10 }] })
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 150, clientY: 200 }] })
    expect(shown()).toEqual(['B', 'C', 'D'])
  })

  it('shows one slide per view on phones', () => {
    mockPerView(1)
    const { shown } = renderCarousel()
    expect(shown()).toEqual(['A'])
  })

  it('renders a single item without arrows or clones', () => {
    const { slides } = renderCarousel(['Only'])
    expect(slides()).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Suivant' })).toBeNull()
    expect(slides()[0].inert).toBe(false)
  })
})
