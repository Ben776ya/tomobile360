'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { checkAdmin, type UserRole } from '@/lib/auth/check-admin'

const ASSIGNABLE_ROLES: UserRole[] = ['admin', 'journalist', 'user']

/**
 * Sets a user's role. `role` is the source of truth — `profiles.is_admin` is
 * derived from it by the profiles_role_guard trigger and must never be written
 * from application code.
 */
export async function setUserRole(userId: string, role: UserRole) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { error: 'Rôle invalide' }
  }

  // Guards against an admin locking themselves out of the panel.
  if (adminCheck.user!.id === userId) {
    return { error: 'Vous ne pouvez pas modifier votre propre rôle' }
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserProfile(userId: string, data: {
  full_name?: string
  phone?: string
  city?: string
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = createClient()

  const updateData: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }
  if (data.full_name !== undefined) updateData.full_name = data.full_name
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.city !== undefined) updateData.city = data.city

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  if (adminCheck.user!.id === userId) {
    return { error: 'Vous ne pouvez pas supprimer votre propre compte' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
