'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
        setBrandsPerPage(1)
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

  const visibleBrands = brands.slice(currentIndex, currentIndex + brandsPerPage)

  // If there aren't enough brands to fill, add from the beginning
  const displayBrands = visibleBrands.length < brandsPerPage
    ? [...visibleBrands, ...brands.slice(0, brandsPerPage - visibleBrands.length)]
    : visibleBrands

  const totalPages = Math.ceil(brands.length / brandsPerPage)
  const currentPage = Math.floor(currentIndex / brandsPerPage)

  return (
    <section
      className="pt-1 pb-4 md:pb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden p-6 md:p-8">
          <div className="w-full sm:w-3/4 mx-auto">
            {/* Section Title */}
            {showTitle && (
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-700 mb-2">
                  SÉLECTIONNEZ LA MARQUE DE VOTRE CHOIX
                </h2>
                <p className="text-gray-600">
                  Découvrez toutes les marques disponibles sur notre plateforme
                </p>
              </div>
            )}

            {/* Carousel */}
            <div className="relative">
              {/* Brands Container */}
              <div className="flex-1">
                <div
                  className="grid gap-3 sm:gap-5 md:gap-6"
                  style={{ gridTemplateColumns: `repeat(${brandsPerPage}, minmax(0, 1fr))` }}
                >
                  {displayBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/neuf?brand=${brand.id}`}
                      className="group flex flex-col items-center justify-center
                                 bg-white border border-gray-100 rounded-xl p-3 sm:p-4 md:p-5
                                 min-h-[64px] sm:min-h-[72px] md:min-h-[80px]
                                 hover:border-secondary/30 hover:shadow-glow-cyan-sm
                                 transition-all duration-300"
                    >
                      {brand.logo_url ? (
                        <div className="relative w-full h-14 sm:h-12 md:h-14">
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            fill
                            className="object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                            sizes="(max-width: 640px) 120px, (max-width: 768px) 80px, 100px"
                          />
                        </div>
                      ) : (
                        <span className="text-base sm:text-sm md:text-base font-semibold text-gray-500 group-hover:text-secondary transition-colors">
                          {brand.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dot indicators */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i * brandsPerPage)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentPage
                          ? 'w-6 h-2 bg-secondary'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
