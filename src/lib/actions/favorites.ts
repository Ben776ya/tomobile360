'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToFavorites(vehicleId: string, vehicleType: 'new' | 'used') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  const insertData: any = {
    user_id: user.id,
    vehicle_type: vehicleType,
  }

  if (vehicleType === 'new') {
    insertData.vehicle_new_id = vehicleId
  } else {
    insertData.vehicle_used_id = vehicleId
  }

  const { error } = await supabase.from('favorites').insert(insertData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compte/favoris')
  return { success: true }
}

export async function removeFromFavorites(vehicleId: string, vehicleType: 'new' | 'used') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  let query = supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('vehicle_type', vehicleType)

  if (vehicleType === 'new') {
    query = query.eq('vehicle_new_id', vehicleId)
  } else {
    query = query.eq('vehicle_used_id', vehicleId)
  }

  const { error } = await query

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/compte/favoris')
  return { success: true }
}

export async function checkIsFavorite(vehicleId: string, vehicleType: 'new' | 'used') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  let query = supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('vehicle_type', vehicleType)

  if (vehicleType === 'new') {
    query = query.eq('vehicle_new_id', vehicleId)
  } else {
    query = query.eq('vehicle_used_id', vehicleId)
  }

  const { data } = await query.single()

  return !!data
}
