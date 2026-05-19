'use server'

import { createClient } from '@/lib/supabase/server'
import { ControleBookingSchema, validateAction } from '@/lib/validations'

export async function submitControleBooking(formData: {
  city: string
  plate_number: string
  preferred_date: string
  phone: string
}) {
  const validation = validateAction(ControleBookingSchema, formData)
  if (!validation.success) {
    return { error: validation.error, fieldErrors: validation.fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('service_bookings')
    .insert({
      service_type: 'controle_technique',
      city: validation.data.city,
      plate_number: validation.data.plate_number,
      preferred_date: validation.data.preferred_date,
      phone: validation.data.phone,
    })

  if (error) {
    console.error('Controle booking error:', error)
    return { error: 'Une erreur est survenue. Réessayez plus tard.' }
  }

  return { success: true }
}
