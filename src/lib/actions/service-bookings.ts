'use server'

import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'
import { ControleBookingSchema, validateAction } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

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

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // 5 bookings per IP per hour. RLS allows anon INSERT; this is the
  // app-layer cap that protects service_bookings from spam.
  if (!rateLimit(`controle-booking:${ip}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 })) {
    return { error: 'Trop de tentatives. Réessayez dans quelques minutes.' }
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
    Sentry.captureException(error, { tags: { action: 'submitControleBooking' } })
    return { error: 'Une erreur est survenue. Réessayez plus tard.' }
  }

  return { success: true }
}
