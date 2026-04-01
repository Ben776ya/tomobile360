'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { validateAction } from '@/lib/validations'

const NewsletterSchema = z.object({
  email: z.string().email('Adresse email invalide'),
})

export async function subscribeNewsletter(formData: { email: string }) {
  const validation = validateAction(NewsletterSchema, formData)
  if (!validation.success) {
    return { error: validation.error }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: validation.data.email })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Cette adresse est deja inscrite.' }
    }
    console.error('Newsletter subscribe error:', error)
    return { error: 'Une erreur est survenue. Reessayez plus tard.' }
  }

  return { success: true }
}
