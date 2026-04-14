import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FicheTechniqueForm } from '@/components/admin/FicheTechniqueForm'
import type { FicheTechnique } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditFicheTechniquePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: fiche, error } = await supabase
    .from('fiches_techniques')
    .select('id, model_id, specs, en_detail, source_url, created_at, updated_at, models(id, name, brand_id, brands(id, name))')
    .eq('id', params.id)
    .single()

  if (error || !fiche) {
    notFound()
  }

  const brandName = (fiche as any).models?.brands?.name ?? ''
  const modelName = (fiche as any).models?.name ?? ''
  const title = brandName && modelName
    ? `${brandName} ${modelName}`
    : 'Fiche technique'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Modifier la fiche technique
        </h1>
        <p className="text-dark-200">{title}</p>
      </div>
      <FicheTechniqueForm fiche={fiche as unknown as FicheTechnique} />
    </div>
  )
}
