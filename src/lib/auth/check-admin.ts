import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** Roles that grant access to some part of the admin panel. */
export type StaffRole = 'admin' | 'journalist'

/** Every value `profiles.role` can hold. */
export type UserRole = StaffRole | 'user'

/**
 * Reads the role of the current session from `profiles.role` — the single
 * source of truth for permissions. Returns null when signed out or when the
 * user has no profile row (nothing creates one automatically; see
 * `scripts/create-staff-user.mjs`).
 */
export async function getSessionRole(): Promise<UserRole | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role === 'admin' || role === 'journalist' || role === 'user') return role
  return null
}

/**
 * Verifies the calling session holds one of `allowed`.
 * Use from Server Actions / Server Components — returns the canonical shape
 * `{ error, user }` where `error` is null on success.
 */
export async function checkRole(allowed: readonly StaffRole[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' as const, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!allowed.includes(profile?.role as StaffRole)) {
    return { error: 'Accès non autorisé' as const, user: null }
  }

  return { error: null as null, user }
}

/**
 * Route-handler flavour of checkRole: returns the supabase client (so the
 * caller can re-use it for follow-up queries) plus an HTTP status code mapped
 * from the auth state. Use from `app/api/**\/route.ts` handlers.
 */
export async function checkRoleApi(allowed: readonly StaffRole[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' as const, status: 401, supabase, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!allowed.includes(profile?.role as StaffRole)) {
    return { error: 'Accès non autorisé' as const, status: 403, supabase, user: null }
  }

  return { error: null as null, status: 200, supabase, user }
}

const ADMIN_ONLY = ['admin'] as const
const BLOG_STAFF = ['admin', 'journalist'] as const

/** Full administrators only. The default for every admin surface. */
export async function checkAdmin() {
  return checkRole(ADMIN_ONLY)
}

/** Full administrators only — route-handler flavour. */
export async function checkAdminApi() {
  return checkRoleApi(ADMIN_ONLY)
}

/** Admins and journalists — the blog is the only shared surface. */
export async function checkBlogAccess() {
  return checkRole(BLOG_STAFF)
}

/** Admins and journalists — route-handler flavour. */
export async function checkBlogAccessApi() {
  return checkRoleApi(BLOG_STAFF)
}
