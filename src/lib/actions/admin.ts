'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { CoupDeCoeurCategory } from '@/lib/types'
import type { UpdateVideoInput, UpdateVehicleInput, UpdatePromotionInput } from '@/lib/validations'
import { validateAction, UpdateVideoSchema, UpdateVehicleSchema, UpdatePromotionSchema } from '@/lib/validations'

// Check if user is admin
async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié', user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Accès non autorisé', user: null }
  }

  return { user }
}

// Article Actions
export async function createArticle(data: {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  category: string
  tags?: string[]
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category,
      tags: data.tags || [],
      is_published: data.is_published,
      author_id: adminCheck.user!.id,
      published_at: data.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath('/admin/content')
  return { success: true, articleId: article.id }
}

export async function updateArticle(id: string, data: {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  category: string
  tags?: string[]
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category,
      tags: data.tags || [],
      is_published: data.is_published,
      published_at: data.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath(`/actu/${data.slug}`)
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteArticle(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase.from('articles').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/actu')
  revalidatePath('/admin/content')
  return { success: true }
}

// Video Actions
export async function createVideo(data: {
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  duration?: string
  category: string
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { data: video, error } = await supabase
    .from('videos')
    .insert(data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath('/admin/content')
  return { success: true, videoId: video.id }
}

export async function updateVideo(id: string, data: UpdateVideoInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdateVideoSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('videos')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath(`/videos/${id}`)
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteVideo(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase.from('videos').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath('/admin/content')
  return { success: true }
}

// Vehicle Actions
export async function createVehicle(data: {
  brand_id: string
  model_id: string
  year: number
  version?: string
  price_min?: number
  price_max?: number
  fuel_type?: string
  transmission?: string
  engine_size?: number
  cylinders?: number
  horsepower?: number
  torque?: number
  acceleration?: number
  top_speed?: number
  fuel_consumption_city?: number
  fuel_consumption_highway?: number
  fuel_consumption_combined?: number
  co2_emissions?: number
  doors?: number
  seating_capacity?: number
  cargo_capacity?: number
  exterior_color?: string
  interior_color?: string
  warranty_months?: number
  euro_norm?: string
  mileage?: number
  features?: string[]
  safety_features?: string[]
  images?: string[]
  is_available?: boolean
  is_popular?: boolean
  is_new_release?: boolean
  is_coming_soon?: boolean
  dimensions?: Record<string, number>
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles_new')
    .insert({
      ...data,
      is_available: data.is_available ?? true,
      is_popular: data.is_popular ?? false,
      is_new_release: data.is_new_release ?? false,
      is_coming_soon: data.is_coming_soon ?? false,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/vehicles')
  revalidatePath('/')
  return { success: true, vehicleId: vehicle.id }
}

export async function updateVehicle(id: string, data: UpdateVehicleInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdateVehicleSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('vehicles_new')
    .update({
      ...validated.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/vehicles')
  revalidatePath('/')
  return { success: true }
}

export async function deleteVehicle(id: string, type: 'new' | 'used') {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()
  const table = type === 'new' ? 'vehicles_new' : 'vehicles_used'

  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(type === 'new' ? '/neuf' : '/occasion')
  revalidatePath('/admin/vehicles')
  return { success: true }
}

export async function toggleVehicleBadge(
  id: string,
  badge: 'is_popular' | 'is_new_release' | 'is_featured_offer',
  value: boolean
) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('vehicles_new')
    .update({ [badge]: value })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/vehicles')
  return { success: true }
}

export async function setCoupDeCoeur(
  vehicleId: string,
  isCoupDeCoeur: boolean,
  category: CoupDeCoeurCategory | null
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { success: false, error: adminCheck.error }

  const supabase = await createClient()

  // When assigning, auto-deassign the previous vehicle in the same category + slot (EV or thermal)
  if (isCoupDeCoeur && category) {
    const { data: vehicle } = await supabase
      .from('vehicles_new')
      .select('fuel_type')
      .eq('id', vehicleId)
      .single()

    if (vehicle) {
      const isElectric = vehicle.fuel_type === 'Electric'

      const { data: existing } = await supabase
        .from('vehicles_new')
        .select('id, fuel_type')
        .eq('is_coup_de_coeur', true)
        .eq('coup_de_coeur_category', category)
        .neq('id', vehicleId)

      if (existing && existing.length > 0) {
        const toUnsetIds = existing
          .filter(v => (isElectric ? v.fuel_type === 'Electric' : v.fuel_type !== 'Electric'))
          .map(v => v.id)

        if (toUnsetIds.length > 0) {
          await supabase
            .from('vehicles_new')
            .update({ is_coup_de_coeur: false, coup_de_coeur_category: null })
            .in('id', toUnsetIds)
        }
      }
    }
  }

  const { error } = await supabase
    .from('vehicles_new')
    .update({
      is_coup_de_coeur: isCoupDeCoeur,
      coup_de_coeur_category: isCoupDeCoeur ? category : null,
    })
    .eq('id', vehicleId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/coups-de-coeur')
  revalidatePath('/admin/vehicles')
  return { success: true }
}

// Promotion Actions
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

  const supabase = await createClient()

  const { data: promotion, error } = await supabase
    .from('promotions')
    .insert({
      ...data,
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

// User Actions
export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
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

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  // Don't allow deleting yourself
  if (adminCheck.user!.id === userId) {
    return { error: 'Vous ne pouvez pas supprimer votre propre compte' }
  }

  // D-22/D-23: Service-role client for auth.admin operations
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // D-21: Remove auth record (cascades to profiles row via FK)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  // D-24: Revalidate admin users page
  revalidatePath('/admin/users')
  return { success: true }
}

// Brand Actions
export async function getBrands() {
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

export async function updateBrand(id: string, data: { description: string | null }) {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  const supabase = await createClient()
  const { error } = await supabase
    .from('brands')
    .update({ description: data.description })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/brands')
  return { success: true }
}

export async function createBrand(data: { name: string; logo_url: string | null; description: string | null }) {
  const { error: authError } = await checkAdmin()
  if (authError) return { error: authError }

  if (!data.name.trim()) return { error: 'Le nom de la marque est requis' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('brands')
    .insert({ name: data.name.trim(), logo_url: data.logo_url, description: data.description || null })

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/brands')
  return { success: true }
}
