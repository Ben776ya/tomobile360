import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type SelectionFlag = 'is_featured_offer' | 'is_popular' | 'is_coup_de_coeur'

/**
 * The editorial selection pages and the vehicles_new flag that fills each.
 * With no available vehicle under its flag a page shows an empty state, so it
 * is marked noindex and left out of the sitemap until vehicles are flagged
 * again. Same check as the homepage feature tiles (src/app/page.tsx).
 */
export const SELECTION_PAGES: Record<string, SelectionFlag> = {
  '/neuf/promotions': 'is_featured_offer',
  '/neuf/populaires': 'is_popular',
  '/coups-de-coeur': 'is_coup_de_coeur',
}

/** True when at least one available vehicle carries the flag (head count, no rows fetched). */
export async function hasSelection(supabase: SupabaseClient<Database>, flag: SelectionFlag): Promise<boolean> {
  const { count } = await supabase
    .from('vehicles_new')
    .select('id', { count: 'exact', head: true })
    .eq(flag, true)
    .eq('is_available', true)
  return !!count
}
