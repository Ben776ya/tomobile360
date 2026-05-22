import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Magazine, PublicationSlug } from '@/lib/types'

const MAGAZINE_COLUMNS =
  'id, publication, issue_number, issue_date, dossier_title, dossier_subtitle, cover_url, pdf_url, tags, order_position, is_published, created_at, updated_at'

/**
 * Returns the most recent published magazine for the given publication
 * (highest order_position). Returns null if none exist.
 */
export async function getLatestMagazine(
  publication: PublicationSlug
): Promise<Magazine | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_COLUMNS)
    .eq('publication', publication)
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
 * Returns all published magazines for the given publication, newest first.
 */
export async function getAllMagazines(
  publication: PublicationSlug
): Promise<Magazine[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('magazines')
    .select(MAGAZINE_COLUMNS)
    .eq('publication', publication)
    .eq('is_published', true)
    .order('order_position', { ascending: false })
  if (error) {
    console.error('getAllMagazines error', error)
    return []
  }
  return (data ?? []) as Magazine[]
}
