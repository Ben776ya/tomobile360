'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/VehicleCard'

interface LatestVehiclesCarouselProps {
  vehicles: any[]
}

export function LatestVehiclesCarousel({ vehicles }: LatestVehiclesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [vehiclesPerPage, setVehiclesPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVehiclesPerPage(1)
      else if (window.innerWidth < 768) setVehiclesPerPage(2)
      else if (window.innerWidth < 1024) setVehiclesPerPage(3)
      else setVehiclesPerPage(4)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + vehiclesPerPage >= vehicles.length ? 0 : prev + vehiclesPerPage
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [vehicles.length, vehiclesPerPage, isHovered])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, vehicles.length - vehiclesPerPage) : Math.max(0, prev - vehiclesPerPage)
    )
  }, [vehicles.length, vehiclesPerPage])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev + vehiclesPerPage >= vehicles.length ? 0 : prev + vehiclesPerPage
    )
  }, [vehicles.length, vehiclesPerPage])

  const visibleVehicles = vehicles.slice(currentIndex, currentIndex + vehiclesPerPage)
  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage)
  const currentPage = Math.floor(currentIndex / vehiclesPerPage)

  const displayVehicles = visibleVehicles.length < vehiclesPerPage
    ? [...visibleVehicles, ...vehicles.slice(0, vehiclesPerPage - visibleVehicles.length)]
    : visibleVehicles

  return (
    <section
      className="py-8 md:py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card p-6 md:p-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
            Découvrez nos véhicules coup de cœur
          </h2>
          <p className="text-gray-500">
            Les derniers véhicules neufs ajoutés sur notre plateforme
          </p>
        </div>

        <div className="relative">
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10
                       w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white shadow-glow-indigo-sm
                       flex items-center justify-center
                       hover:bg-primary-500 hover:shadow-glow-indigo transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white"
            aria-label="Véhicules précédents"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="mx-8 md:mx-14">
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${vehiclesPerPage}, minmax(0, 1fr))` }}
            >
              {displayVehicles.map((vehicle, index) => (
                <VehicleCard key={`${vehicle.id}-${index}`} vehicle={vehicle} />
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10
                       w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white shadow-glow-indigo-sm
                       flex items-center justify-center
                       hover:bg-primary-500 hover:shadow-glow-indigo transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white"
            aria-label="Véhicules suivants"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * vehiclesPerPage)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'w-8 bg-secondary shadow-gold'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-gold hover:shadow-gold-lg"
          >
            CONSULTER TOUTES LES ANNONCES
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      </div>
    </section>
  )
}
