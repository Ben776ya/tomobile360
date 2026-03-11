'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté pour publier une annonce' }
  }

  const { data: listing, error } = await supabase
    .from('vehicles_used')
    .insert({
      user_id: user.id,
      brand_id: data.brand_id,
      model_id: data.model_id,
      year: data.year,
      mileage: data.mileage,
      fuel_type: data.fuel_type,
      transmission: data.transmission,
      color: data.color,
      condition: data.condition,
      description: data.description,
      price: data.price,
      city: data.city,
      images: data.images,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      seller_type: data.seller_type,
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
