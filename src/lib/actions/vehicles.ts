'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateAction, UsedListingSchema } from '@/lib/validations'

export async function createUsedListing(data: {
  brand_id: string
  model_id: string
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  color: string
  condition: string
  description: string
  price: number
  city: string
  images: string[]
  contact_phone: string
  contact_email: string
  seller_type: string
}): Promise<{ error?: string; fieldErrors?: Record<string, string[]>; success?: boolean; listingId?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté pour publier une annonce' }
  }

  const validated = validateAction(UsedListingSchema, data)
  if (!validated.success) return { error: validated.error, fieldErrors: validated.fieldErrors }

  const { data: listing, error } = await supabase
    .from('vehicles_used')
    .insert({
      user_id: user.id,
      brand_id: validated.data.brand_id,
      model_id: validated.data.model_id,
      year: validated.data.year,
      mileage: validated.data.mileage,
      fuel_type: validated.data.fuel_type,
      transmission: validated.data.transmission,
      color: validated.data.color,
      condition: validated.data.condition,
      description: validated.data.description,
      price: validated.data.price,
      city: validated.data.city,
      images: validated.data.images,
      contact_phone: validated.data.contact_phone,
      contact_email: validated.data.contact_email,
      seller_type: validated.data.seller_type,
      is_active: true,
      is_sold: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  if (!listing) {
    return { error: 'Erreur lors de la création de l\'annonce' }
  }

  // Revalidate relevant paths
  revalidatePath('/occasion', 'page')
  revalidatePath(`/occasion/${listing.id}`, 'page')
  revalidatePath('/compte/mes-annonces', 'page')
  revalidatePath('/', 'page')

  return { success: true, listingId: listing.id }
}
