import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/admin/VehicleForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { VehicleNew, Variant } from '@/lib/types'
import type { Tables } from '@/lib/database.types'

function toStringArray(value: unknown): string[] | null {
  return Array.isArray(value) ? (value as string[]) : null
}

function toRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null
}

function toVariantList(value: unknown): Variant[] | null {
  // `Array.isArray` narrows to `any[]`, which structurally matches `Variant[]`
  // after we've already trusted the DB to store the documented shape.
  return Array.isArray(value) ? (value as Variant[]) : null
}

export default async function EditVehiclePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from('vehicles_new')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!row) {
    notFound()
  }

  // The DB stores images / features / dimensions / variant_list as Json. The
  // form expects the parsed shapes; cast through narrow helpers above.
  const dbVehicle: Tables<'vehicles_new'> = row
  const vehicle: VehicleNew = {
    ...dbVehicle,
    images: toStringArray(dbVehicle.images),
    features: toStringArray(dbVehicle.features),
    safety_features: toStringArray(dbVehicle.safety_features),
    dimensions: toRecord(dbVehicle.dimensions),
    variant_list: toVariantList(dbVehicle.variant_list),
  }

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('name')

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-secondary transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux véhicules
        </Link>
        <h1 className="text-3xl font-bold text-white">Modifier le véhicule</h1>
        <p className="text-dark-200 mt-1">
          Modifiez les informations du véhicule
        </p>
      </div>
      <VehicleForm
        brands={brands || []}
        models={models || []}
        vehicle={vehicle}
        mode="edit"
      />
    </>
  )
}
