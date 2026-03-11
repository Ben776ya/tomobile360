'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Check, X as XIcon } from 'lucide-react'

interface ComparisonTableProps {
  vehicleIds: string[]
}

export function ComparisonTable({ vehicleIds }: ComparisonTableProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('vehicles_new')
      .select(`
        *,
        brands:brand_id (name, logo_url),
        models:model_id (name, category)
      `)
      .in('id', vehicleIds)

    if (data) {
      // Sort vehicles in the order of vehicleIds
      const sorted = vehicleIds
        .map((id) => data.find((v) => v.id === id))
        .filter(Boolean)
      setVehicles(sorted)
    }

    setLoading(false)
  }, [vehicleIds])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-muted-foreground">Chargement de la comparaison...</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return null
  }

  const comparisonRows = [
    { label: 'Image', key: 'image', type: 'image' },
    { label: 'Marque', key: 'brands.name', type: 'text' },
    { label: 'Modèle', key: 'models.name', type: 'text' },
    { label: 'Année', key: 'year', type: 'text' },
    { label: 'Catégorie', key: 'models.category', type: 'text' },
    {
      label: 'Prix',
      key: 'price_min',
      type: 'price',
      format: (v: any) =>
        v.price_min ? formatPrice(v.price_min) : 'Sur demande',
    },
    { label: 'Carburant', key: 'fuel_type', type: 'text' },
    { label: 'Transmission', key: 'transmission', type: 'text' },
    {
      label: 'Puissance',
      key: 'horsepower',
      type: 'text',
      format: (v: any) => (v.horsepower ? `${v.horsepower} ch` : '-'),
    },
    {
      label: 'Cylindrée',
      key: 'engine_size',
      type: 'text',
      format: (v: any) => (v.engine_size ? `${v.engine_size}L` : '-'),
    },
    {
      label: 'Accélération 0-100',
      key: 'acceleration',
      type: 'text',
      format: (v: any) => (v.acceleration ? `${v.acceleration}s` : '-'),
    },
    {
      label: 'Vitesse max',
      key: 'top_speed',
      type: 'text',
      format: (v: any) => (v.top_speed ? `${v.top_speed} km/h` : '-'),
    },
    {
      label: 'Conso. mixte',
      key: 'fuel_consumption_combined',
      type: 'text',
      format: (v: any) =>
        v.fuel_consumption_combined
          ? `${v.fuel_consumption_combined} L/100km`
          : '-',
    },
    {
      label: 'CO2',
      key: 'co2_emissions',
      type: 'text',
      format: (v: any) => (v.co2_emissions ? `${v.co2_emissions} g/km` : '-'),
    },
    {
      label: 'Places',
      key: 'seating_capacity',
      type: 'text',
      format: (v: any) => v.seating_capacity || '-',
    },
    {
      label: 'Volume coffre',
      key: 'cargo_capacity',
      type: 'text',
      format: (v: any) => (v.cargo_capacity ? `${v.cargo_capacity} L` : '-'),
    },
  ]

  const getValue = (vehicle: any, key: string) => {
    const keys = key.split('.')
    let value = vehicle
    for (const k of keys) {
      value = value?.[k]
    }
    return value
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[200px]">
              Caractéristiques
            </th>
            {vehicles.map((vehicle) => (
              <th key={vehicle.id} className="p-4 text-center min-w-[250px]">
                <Link
                  href={`/neuf/${vehicle.brands?.name?.toLowerCase()}/${vehicle.models?.name?.toLowerCase()}/${vehicle.id}`}
                  className="text-accent hover:text-accent/80 font-semibold"
                >
                  {vehicle.brands?.name} {vehicle.models?.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, index) => (
            <tr
              key={row.key}
              className={index % 2 === 0 ? 'bg-muted/20' : 'bg-white'}
            >
              <td className="p-4 font-medium text-sm sticky left-0 bg-inherit z-10">
                {row.label}
              </td>
              {vehicles.map((vehicle) => {
                if (row.type === 'image') {
                  const mainImage = vehicle.images?.[0] || '/placeholder-car.jpg'
                  return (
                    <td key={vehicle.id} className="p-4">
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted mx-auto max-w-[200px]">
                        <Image
                          src={mainImage}
                          alt={`${vehicle.brands?.name} ${vehicle.models?.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                  )
                }

                const value = row.format
                  ? row.format(vehicle)
                  : getValue(vehicle, row.key)

                return (
                  <td key={vehicle.id} className="p-4 text-center text-sm">
                    {value || '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
