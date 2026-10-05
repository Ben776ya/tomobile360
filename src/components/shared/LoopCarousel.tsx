'use client'

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LoopCarouselProps {
  children: ReactNode
  /** Accessible name of the carousel region */
  label: string
  prevLabel?: string
  nextLabel?: string
  className?: string
}

// Slides per view: 1 below sm, 2 from sm, 3 from md (kept in sync with the
// `--per-view` classes on the track below).
const PER_VIEW_QUERIES: Array<[string, number]> = [
  ['(min-width: 768px)', 3],
  ['(min-width: 640px)', 2],
]
// Clones on each side = the largest per-view, so a full window is always filled.
const CLONES = 3
const TRANSITION_MS = 450

function usePerView(): number | null {
  const [perView, setPerView] = useState<number | null>(null)
  useEffect(() => {
    const lists = PER_VIEW_QUERIES.map(([q]) => window.matchMedia(q))
    const update = () => setPerView(PER_VIEW_QUERIES.find((_, i) => lists[i].matches)?.[1] ?? 1)
    update()
    lists.forEach((l) => l.addEventListener('change', update))
    return () => lists.forEach((l) => l.removeEventListener('change', update))
  }, [])
  return perView
}

/**
 * Endless carousel: 1/2/3 slides per view with small arrows (and swipe on
 * touch). Slides are cloned on both sides; after a move lands on a clone the
 * track silently jumps back to the matching real slide. Slides outside the
 * window are inert so focus and screen readers only reach what is visible.
 */
export function LoopCarousel({
  children,
  label,
  prevLabel = 'Précédent',
  nextLabel = 'Suivant',
  className = '',
}: LoopCarouselProps) {
  const items = Children.toArray(children)
  const n = items.length
  const loops = n > 1

  const [index, setIndex] = useState(loops ? CLONES : 0)
  const [animate, setAnimate] = useState(true)
  const perView = usePerView()
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const step = useCallback(
    (delta: number) => {
      setAnimate(true)
      // Bounded so a burst of clicks can't run past the clones before the
      // jump-back below has normalised the position.
      setIndex((i) => Math.min(Math.max(i + delta, 0), n + CLONES))
    },
    [n],
  )

  // Once a move has settled on a clone, jump (without animating) to the real slide.
  useEffect(() => {
    if (!loops || (index >= CLONES && index < CLONES + n)) return
    const timer = setTimeout(() => {
      setAnimate(false)
      setIndex(CLONES + ((((index - CLONES) % n) + n) % n))
    }, TRANSITION_MS)
    return () => clearTimeout(timer)
  }, [index, loops, n])

  // Flush the un-animated jump before re-enabling the transition.
  useLayoutEffect(() => {
    if (animate) return
    void trackRef.current?.offsetWidth
    setAnimate(true)
  }, [animate])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
  }

  const slides = loops
    ? [
        ...Array.from({ length: CLONES }, (_, k) => items[(((k - CLONES) % n) + n) % n]),
        ...items,
        ...Array.from({ length: CLONES }, (_, k) => items[k % n]),
      ]
    : items

  // Before the per-view is known (server render, first paint) only clones are
  // hidden; afterwards everything outside the visible window is.
  const isHidden = (i: number) => {
    if (!loops) return false
    if (perView === null) return i < CLONES || i >= CLONES + n
    return i < index || i >= index + perView
  }

  const arrowClass =
    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gray-300/80 bg-white/70 text-gray-500 transition-colors duration-200 hover:border-secondary hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary'

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={`flex items-center gap-2 ${className}`}>
      {loops && (
        <button type="button" onClick={() => step(-1)} className={arrowClass} aria-label={prevLabel}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Vertical padding (offset by negative margin) leaves room for the
          tiles' hover lift and drop shadow inside the clipping box. */}
      <div
        className="-mb-5 -mt-2 min-w-0 flex-1 overflow-hidden pb-5 pt-2"
        data-carousel-viewport
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className={`flex [--per-view:1] sm:[--per-view:2] md:[--per-view:3] ${
            animate
              ? 'transition-transform [transition-duration:450ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none'
              : ''
          }`}
          style={
            {
              '--loop-index': index,
              transform: 'translateX(calc(var(--loop-index) * -100% / var(--per-view)))',
            } as React.CSSProperties
          }
        >
          {slides.map((item, i) => {
            const hidden = isHidden(i)
            const real = loops ? ((((i - CLONES) % n) + n) % n) : i
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${real + 1} sur ${n}`}
                aria-hidden={hidden || undefined}
                // React 18 has no `inert` prop support; set the DOM property.
                ref={(el) => {
                  if (el) el.inert = hidden
                }}
                className="flex-shrink-0 grow-0 basis-[calc(100%/var(--per-view))] px-3"
              >
                {item}
              </div>
            )
          })}
        </div>
      </div>

      {loops && (
        <button type="button" onClick={() => step(1)} className={arrowClass} aria-label={nextLabel}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
