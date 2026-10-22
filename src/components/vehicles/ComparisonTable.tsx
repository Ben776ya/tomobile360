'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, X as XIcon } from 'lucide-react'
import { slug } from '@/lib/slug'
import {
  SPEC_UNAVAILABLE,
  VERSION_SPEC_LABELS,
  getVersionSpecs,
  selectVariant,
  vehicleVariants,
  versionSlug,
  type VersionSpecKey,
} from '@/lib/vehicles/version-specs'

interface ComparisonTableProps {
  vehicleIds: string[]
  /** Version slug per column (same order as vehicleIds); missing → the model page's default version. */
  versions?: (string | null)[]
}

/** Same figures as the model page's « Points clés » plus the comparator's extra rows. */
const SPEC_ROWS: VersionSpecKey[] = [
  'price', 'fuel', 'transmission', 'power', 'engineSize', 'acceleration',
  'topSpeed', 'consumption', 'co2', 'seats', 'trunk', 'torque',
]

export function ComparisonTable({ vehicleIds, versions }: ComparisonTableProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [fiches, setFiches] = useState<Record<string, { specs: unknown }>>({})
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
      // Same model-level fiche the model page reads, so both show the same figures.
      const { data: ficheRows } = await supabase
        .from('fiches_techniques')
        .select('model_id, specs')
        .in('model_id', data.map((v) => v.model_id))
      const ficheMap: Record<string, { specs: unknown }> = {}
      ;(ficheRows ?? []).forEach((f) => { ficheMap[f.model_id] = f })
      setFiches(ficheMap)
      setVehicles(data)
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

  // One column per requested slot, each pinned to an identified version and
  // read through the model page's reader (same fiche, same French labels).
  const columns = vehicleIds.flatMap((id, i) => {
    const vehicle = vehicles.find((v) => v.id === id)
    if (!vehicle) return []
    const variants = vehicleVariants(vehicle)
    const fiche = fiches[vehicle.model_id]
    const variant = selectVariant(variants, fiche, versions?.[i])
    return [{ key: `${id}-${i}`, vehicle, variant, specs: getVersionSpecs({ vehicle, fiche, variant, variants }) }]
  })
  type Column = (typeof columns)[number]

  if (columns.length === 0) {
    return null
  }

  const comparisonRows: { label: string; key: string; type: 'image' | 'text'; format?: (c: Column) => string | null; compare?: boolean }[] = [
    { label: 'Image', key: 'image', type: 'image' },
    { label: 'Marque', key: 'brand', type: 'text', format: (c) => c.vehicle.brands?.name ?? null },
    { label: 'Modèle', key: 'model', type: 'text', format: (c) => c.vehicle.models?.name ?? null },
    { label: 'Version', key: 'version', type: 'text', format: (c) => c.variant.version },
    { label: 'Année', key: 'year', type: 'text', format: (c) => (c.vehicle.year ? String(c.vehicle.year) : null) },
    { label: 'Catégorie', key: 'category', type: 'text', format: (c) => c.vehicle.models?.category ?? null },
    ...SPEC_ROWS.map((key) => ({
      label: VERSION_SPEC_LABELS[key],
      key,
      type: 'text' as const,
      format: (c: Column) => c.specs[key],
      compare: true,
    })),
  ]

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      {columns.length > 1 && (
        <p className="px-4 pt-4 text-xs text-gray-500">
          En bleu : les valeurs qui diffèrent entre les versions comparées.
        </p>
      )}
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[200px]">
              Caractéristiques
            </th>
            {columns.map(({ key, vehicle, variant }) => (
              <th key={key} className="p-4 text-center min-w-[250px]">
                <Link
                  href={`/neuf/${slug(vehicle.brands?.name || '')}/${slug(vehicle.models?.name || '')}${variant.version ? `?version=${versionSlug(variant)}` : ''}`}
                  className="text-accent hover:text-accent/80 font-semibold"
                >
                  {vehicle.brands?.name} {vehicle.models?.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, index) => {
            const values = columns.map((c) => row.format?.(c) ?? null)
            // Highlight only real differences between known values.
            const differs = !!row.compare && new Set(values.filter(Boolean)).size > 1
            return (
            <tr
              key={row.key}
              className={index % 2 === 0 ? 'bg-muted/20' : 'bg-white'}
            >
              <td className="p-4 font-medium text-sm sticky left-0 bg-inherit z-10">
                {row.label}
              </td>
              {columns.map(({ key, vehicle }, i) => {
                if (row.type === 'image') {
                  const mainImage = vehicle.images?.[0] || '/placeholder-car.svg'
                  return (
                    <td key={key} className="p-4">
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

                const value = values[i]

                return (
                  <td key={key} className="p-4 text-center text-sm">
                    {value ? (
                      <span className={differs ? 'font-semibold text-secondary' : undefined}>{value}</span>
                    ) : (
                      <span className="text-gray-400">{SPEC_UNAVAILABLE}</span>
                    )}
                  </td>
                )
              })}
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
