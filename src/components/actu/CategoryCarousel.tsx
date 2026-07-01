'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ACTU_FILTERS } from '@/lib/blog/categories'

interface CategoryCarouselProps {
  activeCategory: string
}

export function CategoryCarousel({ activeCategory }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 1)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows])

  const scrollByDir = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          aria-label="Catégories précédentes"
          onClick={() => scrollByDir(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg ring-1 ring-white/15 hover:bg-primary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        data-testid="category-scroll"
        className="flex gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {ACTU_FILTERS.map((cat) => {
          const isActive = activeCategory === cat.value
          return (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/actu' : `/actu?category=${cat.value}`}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-secondary text-white font-bold shadow-[0_4px_15px_rgba(0,110,254,0.4)]'
                  : 'bg-white/[0.08] text-white/85 border border-white/10 hover:bg-white/[0.15] hover:text-white'
              }`}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      {canRight && (
        <button
          type="button"
          aria-label="Catégories suivantes"
          onClick={() => scrollByDir(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg ring-1 ring-white/15 hover:bg-primary transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
