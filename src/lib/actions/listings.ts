'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteUsedListing(listingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('vehicles_used')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { error: 'Vous n\'avez pas la permission de supprimer cette annonce' }
  }

  const { error } = await supabase
    .from('vehicles_used')
    .delete()
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compte/mes-annonces')
  revalidatePath('/occasion')
  return { success: true }
}

export async function markAsSold(listingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('vehicles_used')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { error: 'Vous n\'avez pas la permission de modifier cette annonce' }
  }

  const { error } = await supabase
    .from('vehicles_used')
    .update({ is_sold: true })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compte/mes-annonces')
  revalidatePath('/occasion')
  return { success: true }
}

export async function toggleListingStatus(listingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('vehicles_used')
    .select('user_id, is_active')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { error: 'Vous n\'avez pas la permission de modifier cette annonce' }
  }

  const { error } = await supabase
    .from('vehicles_used')
    .update({ is_active: !listing.is_active })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compte/mes-annonces')
  revalidatePath('/occasion')
  return { success: true }
}
