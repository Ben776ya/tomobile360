'use client'

import { useState, useEffect, useRef, useCallback, Children, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MobileCarouselProps {
  children: ReactNode
  /** Tailwind classes for the desktop grid layout */
  desktopClassName?: string
  /** Auto-advance interval in ms (0 to disable) */
  autoPlayMs?: number
  /** Breakpoint below which carousel activates (default 768 = md) */
  breakpoint?: number
}

export function MobileCarousel({
  children,
  desktopClassName = '',
  autoPlayMs = 5000,
  breakpoint = 768,
}: MobileCarouselProps) {
  const items = Children.toArray(children)
  const n = items.length

  // Extended slides: [cloneOfLast, ...items, cloneOfFirst]
  const slides = n > 1 ? [items[n - 1], ...items, items[0]] : items
  const total = slides.length

  // current = index into `slides`. Start at 1 (= first real item) when looping.
  const [current, setCurrent] = useState(n > 1 ? 1 : 0)
  const [animate, setAnimate] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  // Auto-play (mobile only, paused during drag)
  useEffect(() => {
    if (!isMobile || !autoPlayMs || dragging || n <= 1) return
    const timer = setInterval(() => {
      setAnimate(true)
      setCurrent((c) => c + 1)
    }, autoPlayMs)
    return () => clearInterval(timer)
  }, [isMobile, autoPlayMs, dragging, n])

  // After landing on a clone, silently snap back to the matching real slide.
  // Guard against bubble-up from child transitions (e.g. card hover effects).
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return
    if (n <= 1) return
    if (current === total - 1) {
      setAnimate(false)
      setCurrent(1)
    } else if (current === 0) {
      setAnimate(false)
      setCurrent(n)
    }
  }

  // Re-enable animation on the frame after a silent snap
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  // Relative navigation (arrows, swipe) — functional updater avoids stale closure
  const step = useCallback((delta: number) => {
    setAnimate(true)
    setCurrent((c) => c + delta)
  }, [])

  // Absolute navigation (dots) — jumps to a specific real-slide index
  const goToIndex = useCallback((nextIndex: number) => {
    setAnimate(true)
    setCurrent(nextIndex)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
    setDragOffset(touchDeltaX.current)
  }

  const handleTouchEnd = () => {
    setDragging(false)
    setDragOffset(0)
    const threshold = 50
    if (touchDeltaX.current < -threshold) {
      step(1)
    } else if (touchDeltaX.current > threshold) {
      step(-1)
    }
  }

  // Desktop: render normally
  if (!isMobile) {
    return <div className={desktopClassName}>{children}</div>
  }

  const containerWidth = containerRef.current?.offsetWidth || 375
  const translateX = -(current * 100) + (dragOffset / containerWidth) * 100

  // Active dot — map `current` back to the real-items index
  const activeDot = n > 1 ? ((current - 1) % n + n) % n : 0

  return (
    <div className="relative">
      {/* Carousel track */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(${translateX}%)`,
            transition: animate && !dragging ? 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {slides.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 px-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow buttons */}
      {n > 1 && (
        <>
          <button
            onClick={() => step(-1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-opacity"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => step(1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-opacity"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators — one per REAL item */}
      {n > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeDot ? 'w-6 bg-primary' : 'w-2 bg-gray-300/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
