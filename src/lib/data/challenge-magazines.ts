import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Magazine } from '@/lib/types'

const MAGAZINE_COLUMNS =
  'id, issue_number, issue_date, dossier_title, dossier_subtitle, cover_url, pdf_url, tags, order_position, is_published, created_at, updated_at'

/**
 * Returns the most recent published magazine (highest order_position).
 * Returns null if no published magazine exists.
 */
export async function getLatestMagazine(): Promise<Magazine | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_COLUMNS)
    .eq('is_published', true)
    .order('order_position', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('getLatestMagazine error', error)
    return null
  }
  return (data as Magazine | null) ?? null
}

/**
 * Returns all published magazines, newest first (descending order_position).
 */
export async function getAllMagazines(): Promise<Magazine[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_COLUMNS)
    .eq('is_published', true)
    .order('order_position', { ascending: false })
  if (error) {
    console.error('getAllMagazines error', error)
    return []
  }
  return (data ?? []) as Magazine[]
}
