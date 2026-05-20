import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the calling session belongs to an admin (profiles.is_admin = true).
 * Use from Server Actions / Server Components — returns the canonical shape
 * `{ error, user }` where `error` is null on success.
 */
export async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' as const, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Accès non autorisé' as const, user: null }
  }

  return { error: null as null, user }
}

/**
 * Route-handler flavour of checkAdmin: returns the supabase client (so the
 * caller can re-use it for follow-up queries) plus an HTTP status code mapped
 * from the auth state. Use from `app/api/**\/route.ts` handlers.
 */
export async function checkAdminApi() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' as const, status: 401, supabase, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Accès non autorisé' as const, status: 403, supabase, user: null }
  }

  return { error: null as null, status: 200, supabase, user }
}
