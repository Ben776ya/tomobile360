'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdmin } from '@/lib/auth/check-admin'
import { validateAction, UpdatePromotionSchema } from '@/lib/validations'
import type { UpdatePromotionInput } from '@/lib/validations'

export async function deletePromotion(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase.from('promotions').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/promotions')
  return { success: true }
}

export async function createPromotion(data: {
  vehicle_id: string
  title: string
  description?: string
  discount_percentage?: number
  discount_amount?: number
  valid_from: string
  valid_until: string
  terms?: string
  is_active?: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  if (data.discount_percentage != null && (data.discount_percentage < 0 || data.discount_percentage > 100)) {
    return { error: 'Le pourcentage de réduction doit être entre 0 et 100' }
  }
  if (data.discount_amount != null && data.discount_amount < 0) {
    return { error: 'Le montant de réduction doit être positif' }
  }
  if (data.valid_from && data.valid_until && data.valid_from > data.valid_until) {
    return { error: 'La date de début doit précéder la date de fin' }
  }

  const supabase = await createClient()

  const { data: promotion, error } = await supabase
    .from('promotions')
    .insert({
      vehicle_id: data.vehicle_id,
      title: data.title,
      description: data.description || null,
      discount_percentage: data.discount_percentage ?? null,
      discount_amount: data.discount_amount ?? null,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      terms: data.terms || null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/promotions')
  return { success: true, promotionId: promotion.id }
}

export async function updatePromotion(id: string, data: UpdatePromotionInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdatePromotionSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('promotions')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/promotions')
  return { success: true }
}

export async function togglePromotionStatus(id: string, is_active: boolean) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('promotions')
    .update({ is_active })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/promotions')
  return { success: true }
}
