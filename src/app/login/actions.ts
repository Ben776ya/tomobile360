'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SignInState = { error?: string }

/**
 * Email + password sign-in. On success the @supabase/ssr server client writes
 * the auth session cookies (works from a Server Action), then we redirect to
 * the admin dashboard. The /admin gate (middleware + layout) re-checks the
 * is_admin role server-side.
 */
export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Veuillez renseigner votre email et votre mot de passe.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/admin')
}
