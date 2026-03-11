'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Promotion } from '@/lib/types'

interface PromotionCarouselProps {
  promotions: (Promotion & {
    vehicles_new?: {
      id: string
      brands?: { name: string }
      models?: { name: string }
      images: string[] | null
    } | null
  })[]
}

export function PromotionCarousel({ promotions }: PromotionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (promotions.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length)
    }, 5000) // Auto-rotate every 5 seconds

    return () => clearInterval(interval)
  }, [promotions.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length)
  }

  if (promotions.length === 0) {
    return null
  }

  const currentPromotion = promotions[currentIndex]

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl group">
      {/* Promotion Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentPromotion.vehicles_new?.images?.[0] || '/placeholder-car.jpg'}
          alt={currentPromotion.title}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <div className="max-w-2xl">
          {currentPromotion.vehicles_new?.brands && (
            <p className="text-sm md:text-base font-medium mb-2 text-accent">
              {currentPromotion.vehicles_new.brands.name}{' '}
              {currentPromotion.vehicles_new.models?.name}
            </p>
          )}
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            {currentPromotion.title}
          </h2>
          <p className="text-base md:text-lg mb-4 text-white/90">
            {currentPromotion.description}
          </p>
          {currentPromotion.discount_amount && (
            <div className="inline-block bg-accent px-4 py-2 rounded-md font-bold text-lg mb-4">
              -{currentPromotion.discount_amount.toLocaleString()} DH
            </div>
          )}
          {currentPromotion.discount_percentage && (
            <div className="inline-block bg-accent px-4 py-2 rounded-md font-bold text-lg mb-4 ml-2">
              -{currentPromotion.discount_percentage}%
            </div>
          )}
          <div className="mt-4">
            <Link
              href={
                currentPromotion.vehicle_id
                  ? `/neuf/${currentPromotion.vehicles_new?.brands?.name}/${currentPromotion.vehicles_new?.models?.name}/${currentPromotion.vehicle_id}`
                  : '/neuf/promotions'
              }
              className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-md hover:bg-white/90 transition"
            >
              Voir l&apos;offre
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {promotions.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            aria-label="Next promotion"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {promotions.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to promotion ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
