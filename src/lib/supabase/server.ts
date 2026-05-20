import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// NOTE: client is intentionally un-genericized.
//
// Adding `<Database>` here surfaces 80+ type errors across admin pages
// because the Supabase JS SDK's row inference from `.select('a, b, c')`
// strings does not reliably propagate the generated row types — the parsed
// types collapse to `never`, which then breaks every property access on
// the result.
//
// Tracked attempt: Cluster D of the 2026-05-20 audit (PR cluster-d). The
// proper fix is a per-call-site migration to either:
//   1. `.returns<RowType>()` annotations on every query, OR
//   2. switching from `.select('col, col')` strings to typed builders
//
// Callers that need typed results today can use the generated row helpers:
//   import type { Tables } from '@/lib/database.types'
//   const brand = data as Tables<'brands'>
// or pass an explicit type to `.returns<T>()` on the query.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Called from a Server Component — middleware refreshes the session,
            // so this is safe to ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Same caveat as set().
          }
        },
      },
    },
  )
}
