import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Typed Supabase server client.
//
// The `<Database>` generic propagates row, insert, and update types from the
// auto-generated `database.types.ts` into every `.from('table')` builder so
// callers get full type safety on query results, inserts, updates, and
// filters.
//
// Call sites that use `.select('col, col')` string projections should pair
// the query with `.returns<RowType>()` to give the SDK a precise return
// shape — the column-string parser otherwise narrows the row to `never`.
// For column subsets prefer `Pick<Tables<'foo'>, 'a' | 'b'>`; for queries
// that include nested joins define an inline type that mirrors the join.
//
// Implementation note: `@supabase/ssr@0.5.2`'s `createServerClient` forwards
// its generics into a different set of slots than `SupabaseClient` from
// `@supabase/supabase-js@2.93.x` expects (the newer class signature added a
// `SchemaNameOrClientOptions` slot). The runtime client is correct either
// way; we narrow the return type to `SupabaseClient<Database>` so callers
// see the full typed `from()` / `rpc()` builders.
export function createClient(): SupabaseClient<Database> {
  const cookieStore = cookies()

  const client = createServerClient<Database>(
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

  // Re-narrow via `unknown` because the SSR return type's third generic slot
  // is `Schema` (an object), but the newer `SupabaseClient` class expects
  // that slot to be `SchemaName` (a string literal). The runtime instance is
  // identical; only the type parameter positions differ.
  return client as unknown as SupabaseClient<Database>
}
