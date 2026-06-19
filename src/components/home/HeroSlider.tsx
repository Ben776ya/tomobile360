'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export interface HeroSlide {
  src: string
  alt: string
}

interface HeroSliderProps {
  images: HeroSlide[]
  /** Autoplay interval in milliseconds. */
  intervalMs?: number
}

/**
 * Full-bleed crossfade slideshow for the homepage hero background. Images are
 * stacked (absolute inset-0) and toggle opacity, so the search panel layered on
 * top stays rock-steady while the photo behind it changes. Autoplays (paused on
 * hover and for users who prefer reduced motion) with clickable dots.
 */
export function HeroSlider({ images, intervalMs = 5000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (images.length <= 1 || isHovered) return

    // Respect users who opt out of motion — no autoplay for them.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, isHovered, intervalMs])

  if (images.length === 0) return null

  return (
    <div
      // No z-index here so the wrapper doesn't create a stacking context: the
      // images paint at the bottom (below the z-[1] gradient / z-10 panel) while
      // the z-20 dots can still rise above the panel.
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          // Bias the crop right-of-center so narrow screens still favour the car.
          className={`object-cover object-[70%_center] transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          priority={i === 0}
          sizes="100vw"
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-4 right-1/4 z-20 flex items-center gap-2">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === current}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
