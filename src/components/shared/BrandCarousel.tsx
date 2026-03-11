'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BrandCarouselProps {
  brands: Array<{
    id: string
    name: string
    logo_url: string | null
  }>
  showTitle?: boolean
}

export function BrandCarousel({ brands, showTitle = true }: BrandCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Responsive brands per page
  const [brandsPerPage, setBrandsPerPage] = useState(6)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBrandsPerPage(3)
      } else if (window.innerWidth < 768) {
        setBrandsPerPage(4)
      } else if (window.innerWidth < 1024) {
        setBrandsPerPage(5)
      } else {
        setBrandsPerPage(6)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-rotate every 4 seconds (pause on hover)
  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + brandsPerPage >= brands.length ? 0 : prev + brandsPerPage
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [brands.length, brandsPerPage, isHovered])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, brands.length - brandsPerPage) : Math.max(0, prev - brandsPerPage)
    )
  }, [brands.length, brandsPerPage])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev + brandsPerPage >= brands.length ? 0 : prev + brandsPerPage
    )
  }, [brands.length, brandsPerPage])

  const visibleBrands = brands.slice(currentIndex, currentIndex + brandsPerPage)

  // If there aren't enough brands to fill, add from the beginning
  const displayBrands = visibleBrands.length < brandsPerPage
    ? [...visibleBrands, ...brands.slice(0, brandsPerPage - visibleBrands.length)]
    : visibleBrands

  return (
    <section
      className="pt-1 pb-8 md:pb-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-4">
        <div className="bg-muted/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 shadow-card p-6 md:p-8">
          <div className="w-3/4 mx-auto">
            {/* Section Title */}
            {showTitle && (
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  SÉLECTIONNEZ LA MARQUE DE VOTRE CHOIX
                </h2>
                <p className="text-gray-600">
                  Découvrez toutes les marques disponibles sur notre plateforme
                </p>
              </div>
            )}

            {/* Carousel */}
            <div className="relative flex items-center">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-secondary hover:border-secondary/30 hover:shadow-glow-cyan-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white mr-3"
                aria-label="Marques précédentes"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Brands Container */}
              <div className="flex-1">
                <div
                  className="grid gap-5 md:gap-6"
                  style={{ gridTemplateColumns: `repeat(${brandsPerPage}, minmax(0, 1fr))` }}
                >
                  {displayBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/neuf?brand=${brand.id}`}
                      className="group flex flex-col items-center justify-center
                                 bg-white border border-gray-100 rounded-xl p-4 md:p-5
                                 min-h-[96px] md:min-h-[116px]
                                 hover:border-secondary/30 hover:shadow-glow-cyan-sm
                                 transition-all duration-300"
                    >
                      {brand.logo_url ? (
                        <div className="relative w-full h-16 md:h-[72px]">
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            fill
                            className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 80px, 100px"
                          />
                        </div>
                      ) : (
                        <span className="text-sm md:text-base font-semibold text-gray-500 group-hover:text-secondary transition-colors">
                          {brand.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-secondary hover:border-secondary/30 hover:shadow-glow-cyan-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white ml-3"
                aria-label="Marques suivantes"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
