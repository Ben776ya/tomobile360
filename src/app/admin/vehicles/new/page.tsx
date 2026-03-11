import { createClient } from '@/lib/supabase/server'
import { VehicleForm } from '@/components/admin/VehicleForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewVehiclePage() {
  const supabase = await createClient()

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
        <h1 className="text-3xl font-bold text-white">Ajouter un véhicule</h1>
        <p className="text-dark-200 mt-1">
          Remplissez les informations du véhicule neuf
        </p>
      </div>
      <VehicleForm
        brands={brands || []}
        models={models || []}
        mode="create"
      />
    </>
  )
}
