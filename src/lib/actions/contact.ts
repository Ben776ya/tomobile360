'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ContactMessageSchema, validateAction } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

export async function submitContactMessage(formData: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  const validation = validateAction(ContactMessageSchema, formData)
  if (!validation.success) {
    return { error: validation.error, fieldErrors: validation.fieldErrors }
  }

  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? null
  const userAgent = headerList.get('user-agent') ?? null

  // 5 submissions per IP per hour. RLS allows anon INSERT; this is the
  // app-layer cap that protects the contact_messages table from spam.
  if (!rateLimit(`contact:${ip ?? 'unknown'}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 })) {
    return { error: 'Trop de tentatives. Réessayez dans quelques minutes.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_messages')
    .insert({
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone ?? null,
      subject: validation.data.subject,
      message: validation.data.message,
      ip_address: ip,
      user_agent: userAgent,
    })

  if (error) {
    console.error('Contact submit error:', error)
    return { error: 'Une erreur est survenue. Réessayez plus tard.' }
  }

  return { success: true }
}
