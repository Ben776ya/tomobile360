'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VehicleSelector } from '@/components/vehicles/VehicleSelector'
import { ComparisonTable } from '@/components/vehicles/ComparisonTable'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

interface VehicleData {
  id: string
  year: number
  price_min: number | null
  images: string[] | null
  brands: { name: string; logo_url: string | null } | null
  models: { name: string } | null
}

export default function ComparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [vehicleData, setVehicleData] = useState<Record<string, VehicleData>>({})
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const fetchedIdsRef = useRef<Set<string>>(new Set())

  const fetchVehicleData = useCallback(async (vehicleIds: string[]) => {
    // Only fetch data for vehicles we haven't fetched yet
    const newIds = vehicleIds.filter(id => !fetchedIdsRef.current.has(id))
    if (newIds.length === 0) return

    // Mark these IDs as being fetched
    newIds.forEach(id => fetchedIdsRef.current.add(id))

    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('vehicles_new')
      .select(`
        id,
        year,
        price_min,
        images,
        brands:brand_id (name, logo_url),
        models:model_id (name)
      `)
      .in('id', newIds)

    if (data) {
      setVehicleData(prev => {
        const dataMap: Record<string, VehicleData> = { ...prev }
        data.forEach((vehicle: any) => {
          dataMap[vehicle.id] = vehicle
        })
        return dataMap
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Parse vehicle IDs from URL
    const vehicles = searchParams.getAll('v')
    setSelectedVehicles(vehicles)

    // Fetch vehicle data for selected IDs
    if (vehicles.length > 0) {
      fetchVehicleData(vehicles)
    }
  }, [searchParams, fetchVehicleData])

  const handleAddVehicle = (vehicleId: string) => {
    if (selectedVehicles.length >= 3) {
      alert('Vous pouvez comparer jusqu\'à 3 véhicules')
      return
    }

    const newVehicles = [...selectedVehicles, vehicleId]
    updateURL(newVehicles)
    setShowSelector(false)
  }

  const handleRemoveVehicle = (index: number) => {
    const newVehicles = selectedVehicles.filter((_, i) => i !== index)
    updateURL(newVehicles)
  }

  const updateURL = (vehicles: string[]) => {
    const params = new URLSearchParams()
    vehicles.forEach((v) => params.append('v', v))
    router.push(`/neuf/comparer?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/neuf"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux véhicules neufs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Comparateur de Véhicules
          </h1>
          <p className="text-gray-500">
            Comparez jusqu&apos;à 3 véhicules côte à côte
          </p>
        </div>

        {/* Vehicle Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((index) => {
            const vehicleId = selectedVehicles[index]
            const vehicle = vehicleId ? vehicleData[vehicleId] : null

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-4 min-h-[200px] flex items-center justify-center"
              >
                {vehicleId ? (
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Véhicule {index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveVehicle(index)}
                        className="text-gray-400 hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10"
                        title="Retirer ce véhicule"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {loading && !vehicle ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-gray-400 text-sm">
                          Chargement...
                        </div>
                      </div>
                    ) : vehicle ? (
                      <div className="space-y-3">
                        {/* Vehicle Image */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={vehicle.images?.[0] || '/placeholder-car.svg'}
                            alt={`${vehicle.brands?.name} ${vehicle.models?.name}`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Vehicle Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {vehicle.brands?.logo_url && (
                              <Image
                                src={vehicle.brands.logo_url}
                                alt={vehicle.brands.name}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            )}
                            <h3 className="font-semibold text-primary truncate">
                              {vehicle.brands?.name} {vehicle.models?.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-400">
                            {vehicle.year}
                          </p>
                          <p className="text-secondary font-semibold">
                            {vehicle.price_min
                              ? `À partir de ${formatPrice(vehicle.price_min)}`
                              : 'Prix sur demande'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-400 text-sm">
                          Véhicule non trouvé
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSelector(true)}
                    className="flex flex-col items-center gap-3 text-gray-400 hover:text-secondary transition group"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-secondary/10 transition">
                      <Plus className="h-8 w-8" />
                    </div>
                    <span className="font-medium">Sélectionner un véhicule</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        {selectedVehicles.length >= 2 ? (
          <ComparisonTable vehicleIds={selectedVehicles} />
        ) : (
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">
              Sélectionnez au moins 2 véhicules pour commencer la comparaison
            </p>
            <Button onClick={() => setShowSelector(true)} className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Sélectionner des véhicules
            </Button>
          </div>
        )}

        {/* Vehicle Selector Modal */}
        {showSelector && (
          <VehicleSelector
            onSelect={handleAddVehicle}
            onClose={() => setShowSelector(false)}
            excludeIds={selectedVehicles}
          />
        )}
      </div>
    </div>
  )
}
