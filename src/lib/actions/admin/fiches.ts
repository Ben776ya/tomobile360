'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdmin } from '@/lib/auth/check-admin'
import { validateAction, CreateFicheTechniqueSchema, UpdateFicheTechniqueSchema } from '@/lib/validations'

export async function createFicheTechnique(data: {
  model_id: string
  specs: Record<string, string>
  en_detail: Record<string, string[]>
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(CreateFicheTechniqueSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { data: fiche, error } = await supabase
    .from('fiches_techniques')
    .insert({
      model_id: data.model_id,
      specs: data.specs,
      en_detail: data.en_detail,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/fiches-techniques')
  return { success: true, ficheId: fiche.id }
}

export async function updateFicheTechnique(id: string, data: {
  specs: Record<string, string>
  en_detail: Record<string, string[]>
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdateFicheTechniqueSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('fiches_techniques')
    .update({
      specs: data.specs,
      en_detail: data.en_detail,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/fiches-techniques')
  return { success: true }
}

export async function deleteFicheTechnique(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('fiches_techniques')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/fiches-techniques')
  return { success: true }
}
