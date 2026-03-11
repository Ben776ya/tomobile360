import { createClient } from '@/lib/supabase/server'
import { PromotionForm } from '@/components/admin/PromotionForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditPromotionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: promotion } = await supabase
    .from('promotions')
    .select(`
      *,
      vehicles_new:vehicle_id (
        id,
        brands:brand_id (name),
        models:model_id (name),
        images
      )
    `)
    .eq('id', params.id)
    .single()

  if (!promotion) {
    notFound()
  }

  const { data: vehiclesRaw } = await supabase
    .from('vehicles_new')
    .select(`
      id,
      year,
      images,
      price_min,
      brands:brand_id (name),
      models:model_id (name)
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  const vehicles = (vehiclesRaw || []).map((v: any) => ({
    id: v.id,
    brand_name: v.brands?.name || '',
    model_name: v.models?.name || '',
    year: v.year,
    images: v.images,
    price_min: v.price_min,
  }))

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/promotions"
          className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-secondary transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux promotions
        </Link>
        <h1 className="text-3xl font-bold text-white">Modifier la promotion</h1>
        <p className="text-dark-200 mt-1">
          Modifiez les détails de la promotion
        </p>
      </div>
      <PromotionForm vehicles={vehicles} promotion={promotion} mode="edit" />
    </>
  )
}
