'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface VehicleSelectorProps {
  onSelect: (vehicleId: string) => void
  onClose: () => void
  excludeIds: string[]
}

export function VehicleSelector({
  onSelect,
  onClose,
  excludeIds,
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async (query: string) => {
    setLoading(true)
    const supabase = createClient()

    if (query) {
      // Search for matching brands and models in parallel
      const [{ data: matchingBrands }, { data: matchingModels }] = await Promise.all([
        supabase.from('brands').select('id').ilike('name', `%${query}%`),
        supabase.from('models').select('id, brand_id').ilike('name', `%${query}%`),
      ])

      const brandIdSet = new Set<string>()
      matchingBrands?.forEach((b) => brandIdSet.add(b.id))
      matchingModels?.forEach((m) => brandIdSet.add(m.brand_id))
      const modelIds = matchingModels?.map((m) => m.id) || []

      // No matches found — show empty results
      if (brandIdSet.size === 0 && modelIds.length === 0) {
        setVehicles([])
        setLoading(false)
        return
      }

      // Build OR filter parts
      const filters: string[] = []
      if (brandIdSet.size > 0) filters.push(`brand_id.in.(${Array.from(brandIdSet).join(',')})`)
      if (modelIds.length > 0) filters.push(`model_id.in.(${modelIds.join(',')})`)

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
        .or(filters.join(','))
        .order('created_at', { ascending: false })
        .limit(50)

      setVehicles(data ? data.filter((v) => !excludeIds.includes(v.id)) : [])
    } else {
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
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setVehicles(data.filter((v) => !excludeIds.includes(v.id)))
      } else {
        setVehicles([])
      }
    }

    setLoading(false)
  }, [excludeIds])

  // Initial load
  useEffect(() => {
    fetchVehicles('')
  }, [fetchVehicles])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchVehicles])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">
            Sélectionner un véhicule
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par marque ou modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => {
                const mainImage = vehicle.images?.[0] || '/placeholder-car.svg'
                const brandName = vehicle.brands?.name || 'Unknown'
                const modelName = vehicle.models?.name || 'Unknown'

                return (
                  <button
                    key={vehicle.id}
                    onClick={() => onSelect(vehicle.id)}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition text-left"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={mainImage}
                        alt={`${brandName} ${modelName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary mb-1 truncate">
                        {brandName} {modelName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {vehicle.year}
                      </p>
                      <p className="text-accent font-semibold">
                        {vehicle.price_min
                          ? `À partir de ${formatPrice(vehicle.price_min)}`
                          : 'Prix sur demande'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Aucun véhicule trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
