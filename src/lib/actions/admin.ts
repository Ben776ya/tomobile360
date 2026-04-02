'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { CoupDeCoeurCategory } from '@/lib/types'
import type { UpdateVideoInput, UpdateVehicleInput, CreateVehicleInput, UpdatePromotionInput, ArticleInput } from '@/lib/validations'
import { validateAction, UpdateVideoSchema, UpdateVehicleSchema, CreateVehicleSchema, UpdatePromotionSchema, ArticleSchema } from '@/lib/validations'

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

  const validated = validateAction(ArticleSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category.toLowerCase(),
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

  const validated = validateAction(ArticleSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image || null,
      category: data.category.toLowerCase(),
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
    .insert({
      title: data.title,
      description: data.description,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url || null,
      category: data.category.toLowerCase(),
      is_published: data.is_published,
      duration: data.duration || null,
    })
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
export async function createVehicle(data: CreateVehicleInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(CreateVehicleSchema, data)
  if (!validated.success) return { error: validated.error }

  const d = validated.data
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles_new')
    .insert({
      brand_id: d.brand_id,
      model_id: d.model_id,
      year: d.year,
      version: d.version || null,
      price_min: d.price_min ?? null,
      price_max: d.price_max ?? null,
      fuel_type: d.fuel_type || null,
      transmission: d.transmission || null,
      engine_size: d.engine_size ?? null,
      cylinders: d.cylinders ?? null,
      horsepower: d.horsepower ?? null,
      torque: d.torque ?? null,
      acceleration: d.acceleration ?? null,
      top_speed: d.top_speed ?? null,
      fuel_consumption_city: d.fuel_consumption_city ?? null,
      fuel_consumption_highway: d.fuel_consumption_highway ?? null,
      fuel_consumption_combined: d.fuel_consumption_combined ?? null,
      co2_emissions: d.co2_emissions ?? null,
      doors: d.doors ?? null,
      seating_capacity: d.seating_capacity ?? null,
      cargo_capacity: d.cargo_capacity ?? null,
      exterior_color: d.exterior_color || null,
      interior_color: d.interior_color || null,
      warranty_months: d.warranty_months ?? null,
      euro_norm: d.euro_norm || null,
      mileage: d.mileage ?? null,
      features: d.features || [],
      safety_features: d.safety_features || [],
      images: d.images || [],
      dimensions: d.dimensions ?? null,
      is_available: d.is_available ?? true,
      is_popular: d.is_popular ?? false,
      is_new_release: d.is_new_release ?? false,
      is_coming_soon: d.is_coming_soon ?? false,
      is_featured_offer: d.is_featured_offer ?? false,
      coup_de_coeur_reason: d.coup_de_coeur_reason || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/vehicles')
  revalidatePath(`/admin/brands/${d.brand_id}`)
  revalidatePath('/')
  return { success: true, vehicleId: vehicle.id }
}

export async function updateVehicle(id: string, data: UpdateVehicleInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdateVehicleSchema, data)
  if (!validated.success) return { error: validated.error }

  const d = validated.data
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (d.brand_id !== undefined) updateData.brand_id = d.brand_id
  if (d.model_id !== undefined) updateData.model_id = d.model_id
  if (d.year !== undefined) updateData.year = d.year
  if (d.version !== undefined) updateData.version = d.version || null
  if (d.price_min !== undefined) updateData.price_min = d.price_min ?? null
  if (d.price_max !== undefined) updateData.price_max = d.price_max ?? null
  if (d.fuel_type !== undefined) updateData.fuel_type = d.fuel_type || null
  if (d.transmission !== undefined) updateData.transmission = d.transmission || null
  if (d.engine_size !== undefined) updateData.engine_size = d.engine_size ?? null
  if (d.cylinders !== undefined) updateData.cylinders = d.cylinders ?? null
  if (d.horsepower !== undefined) updateData.horsepower = d.horsepower ?? null
  if (d.torque !== undefined) updateData.torque = d.torque ?? null
  if (d.acceleration !== undefined) updateData.acceleration = d.acceleration ?? null
  if (d.top_speed !== undefined) updateData.top_speed = d.top_speed ?? null
  if (d.fuel_consumption_city !== undefined) updateData.fuel_consumption_city = d.fuel_consumption_city ?? null
  if (d.fuel_consumption_highway !== undefined) updateData.fuel_consumption_highway = d.fuel_consumption_highway ?? null
  if (d.fuel_consumption_combined !== undefined) updateData.fuel_consumption_combined = d.fuel_consumption_combined ?? null
  if (d.co2_emissions !== undefined) updateData.co2_emissions = d.co2_emissions ?? null
  if (d.doors !== undefined) updateData.doors = d.doors ?? null
  if (d.seating_capacity !== undefined) updateData.seating_capacity = d.seating_capacity ?? null
  if (d.cargo_capacity !== undefined) updateData.cargo_capacity = d.cargo_capacity ?? null
  if (d.exterior_color !== undefined) updateData.exterior_color = d.exterior_color || null
  if (d.interior_color !== undefined) updateData.interior_color = d.interior_color || null
  if (d.warranty_months !== undefined) updateData.warranty_months = d.warranty_months ?? null
  if (d.euro_norm !== undefined) updateData.euro_norm = d.euro_norm || null
  if (d.mileage !== undefined) updateData.mileage = d.mileage ?? null
  if (d.features !== undefined) updateData.features = d.features || []
  if (d.safety_features !== undefined) updateData.safety_features = d.safety_features || []
  if (d.images !== undefined) updateData.images = d.images || []
  if (d.dimensions !== undefined) updateData.dimensions = d.dimensions ?? null
  if (d.is_available !== undefined) updateData.is_available = d.is_available
  if (d.is_popular !== undefined) updateData.is_popular = d.is_popular
  if (d.is_new_release !== undefined) updateData.is_new_release = d.is_new_release
  if (d.is_coming_soon !== undefined) updateData.is_coming_soon = d.is_coming_soon
  if (d.is_featured_offer !== undefined) updateData.is_featured_offer = d.is_featured_offer
  if (d.coup_de_coeur_reason !== undefined) updateData.coup_de_coeur_reason = d.coup_de_coeur_reason || null

  const supabase = await createClient()

  // Get current brand_id for revalidation
  const { data: currentVehicle } = await supabase
    .from('vehicles_new')
    .select('brand_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('vehicles_new')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/neuf')
  revalidatePath('/admin/vehicles')
  revalidatePath('/')
  if (currentVehicle?.brand_id) revalidatePath(`/admin/brands/${currentVehicle.brand_id}`)
  if (d.brand_id && d.brand_id !== currentVehicle?.brand_id) revalidatePath(`/admin/brands/${d.brand_id}`)
  return { success: true }
}

export async function deleteVehicle(id: string, type: 'new' | 'used') {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()
  const table = type === 'new' ? 'vehicles_new' : 'vehicles_used'

  // Get brand_id before deleting (for revalidation)
  let brandId: string | null = null
  if (type === 'new') {
    const { data: vehicle } = await supabase.from('vehicles_new').select('brand_id').eq('id', id).single()
    brandId = vehicle?.brand_id ?? null
  }

  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(type === 'new' ? '/neuf' : '/occasion')
  revalidatePath('/admin/vehicles')
  if (brandId) revalidatePath(`/admin/brands/${brandId}`)
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

  // Validate discount bounds
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
