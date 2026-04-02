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
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  // Auto-play
  useEffect(() => {
    if (!isMobile || !autoPlayMs || dragging) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length)
    }, autoPlayMs)
    return () => clearInterval(timer)
  }, [isMobile, autoPlayMs, items.length, dragging])

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(index, items.length - 1)))
  }, [items.length])

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
      goTo(current + 1)
    } else if (touchDeltaX.current > threshold) {
      goTo(current - 1)
    }
  }

  // Desktop: render normally
  if (!isMobile) {
    return <div className={desktopClassName}>{children}</div>
  }

  // Mobile: single-item carousel
  const translateX = -(current * 100) + (dragOffset / (containerRef.current?.offsetWidth || 375)) * 100

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
          style={{
            transform: `translateX(${translateX}%)`,
            transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 px-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-0 transition-opacity"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === items.length - 1}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-0 transition-opacity"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-primary' : 'w-2 bg-gray-300/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
