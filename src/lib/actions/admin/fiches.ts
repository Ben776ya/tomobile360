'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdmin } from '@/lib/auth/check-admin'
import { validateAction, CreateFicheTechniqueSchema, UpdateFicheTechniqueSchema } from '@/lib/validations'
import type { Variant } from '@/lib/types'

export async function createFicheTechnique(data: {
  model_id: string
  /** Exact `variant_list` version, or null for a model-level fiche (all versions). */
  version: string | null
  specs: Record<string, string>
  en_detail: Record<string, string[]>
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(CreateFicheTechniqueSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  // The site ties a fiche to a version by exact name: refuse any other.
  if (data.version) {
    const { data: rows } = await supabase
      .from('vehicles_new')
      .select('variant_list')
      .eq('model_id', data.model_id)
    const versions = (rows ?? []).flatMap((r) => ((r.variant_list ?? []) as Variant[]).map((v) => v.version))
    if (!versions.includes(data.version)) return { error: "Cette version n'existe pas pour ce modèle" }
  }

  // Plain insert: the unique (model_id, version) constraint refuses a second
  // fiche for the same version rather than overwriting it.
  const { data: fiche, error } = await supabase
    .from('fiches_techniques')
    .insert({
      model_id: data.model_id,
      // A model-level fiche leaves `version` to its NULL default.
      ...(data.version ? { version: data.version } : {}),
      specs: data.specs,
      en_detail: data.en_detail,
    })
    .select()
    .single()

  if (error) {
    return { error: error.code === '23505' ? 'Une fiche existe déjà pour ce modèle et cette version' : error.message }
  }

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
