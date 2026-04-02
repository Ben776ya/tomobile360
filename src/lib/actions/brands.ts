'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Brand } from '@/lib/types'
import {
  validateAction,
  CreateBrandSchema,
  UpdateBrandSchema,
  CreateModelSchema,
  UpdateModelSchema,
  type CreateBrandInput,
  type UpdateBrandInput,
  type CreateModelInput,
  type UpdateModelInput,
} from '@/lib/validations'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié', user: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Accès non autorisé', user: null }
  return { user }
}

// ── Brands ──────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<{ error: string | null; data: Brand[] | null }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError, data: null }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, logo_url, description, created_at')
    .order('name', { ascending: true })

  if (error) return { error: error.message, data: null }
  return { error: null, data }
}


export async function createBrand(data: CreateBrandInput): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const validation = validateAction(CreateBrandSchema, data)
  if (!validation.success) return { error: validation.error }

  const { name, logo_url, description } = validation.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('brands')
    .insert({
      name: name.trim(),
      logo_url: logo_url ?? null,
      description: description ?? null,
    })

  if (error) {
    if (error.code === '23505') return { error: 'Une marque avec ce nom existe déjà' }
    return { error: error.message }
  }

  revalidatePath('/admin/brands')
  revalidatePath('/neuf')
  return { success: true }
}

export async function updateBrand(id: string, data: UpdateBrandInput): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const validation = validateAction(UpdateBrandSchema, data)
  if (!validation.success) return { error: validation.error }

  const { name, logo_url, description } = validation.data

  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name.trim()
  if (logo_url !== undefined) update.logo_url = logo_url
  if (description !== undefined) update.description = description

  if (Object.keys(update).length === 0) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('brands')
    .update(update)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Une marque avec ce nom existe déjà' }
    return { error: error.message }
  }

  revalidatePath('/admin/brands')
  revalidatePath('/neuf')
  return { success: true }
}

export async function deleteBrand(id: string): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = await createClient()

  // Check for linked vehicles_new
  const { count: vehicleCount } = await supabase
    .from('vehicles_new')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', id)

  if (vehicleCount && vehicleCount > 0) {
    return { error: `Impossible de supprimer : ${vehicleCount} véhicule(s) lié(s) à cette marque` }
  }

  // Check for linked models
  const { count: modelCount } = await supabase
    .from('models')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', id)

  if (modelCount && modelCount > 0) {
    return { error: `Impossible de supprimer : ${modelCount} modèle(s) lié(s) à cette marque` }
  }

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/brands')
  revalidatePath('/neuf')
  return { success: true }
}

// ── Models ───────────────────────────────────────────────────────────────────

export async function createModel(data: CreateModelInput): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const validation = validateAction(CreateModelSchema, data)
  if (!validation.success) return { error: validation.error }

  const { brand_id, name, category } = validation.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('models')
    .insert({
      brand_id,
      name: name.trim(),
      category,
    })

  if (error) {
    if (error.code === '23505') return { error: 'Un modèle avec ce nom existe déjà pour cette marque' }
    return { error: error.message }
  }

  revalidatePath('/admin/brands')
  revalidatePath(`/admin/brands/${brand_id}`)
  revalidatePath('/neuf')
  return { success: true }
}

export async function updateModel(
  id: string,
  brandId: string,
  data: UpdateModelInput
): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const validation = validateAction(UpdateModelSchema, data)
  if (!validation.success) return { error: validation.error }

  const { name, category } = validation.data

  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name.trim()
  if (category !== undefined) update.category = category

  if (Object.keys(update).length === 0) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('models')
    .update(update)
    .eq('id', id)
    .eq('brand_id', brandId)

  if (error) {
    if (error.code === '23505') return { error: 'Un modèle avec ce nom existe déjà pour cette marque' }
    return { error: error.message }
  }

  revalidatePath('/admin/brands')
  revalidatePath(`/admin/brands/${brandId}`)
  revalidatePath('/neuf')
  return { success: true }
}

export async function deleteModel(id: string, brandId: string): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = await createClient()

  // Check for linked vehicles_new
  const { count: vehicleCount } = await supabase
    .from('vehicles_new')
    .select('id', { count: 'exact', head: true })
    .eq('model_id', id)

  if (vehicleCount && vehicleCount > 0) {
    return { error: `Impossible de supprimer : ${vehicleCount} véhicule(s) lié(s) à ce modèle` }
  }

  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', id)
    .eq('brand_id', brandId)

  if (error) return { error: error.message }

  revalidatePath('/admin/brands')
  revalidatePath(`/admin/brands/${brandId}`)
  revalidatePath('/neuf')
  return { success: true }
}
