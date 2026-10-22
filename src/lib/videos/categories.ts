/**
 * Display-only French labels for `videos.category` values (set by the YouTube
 * importer's `categorizeVideo` and the admin form). DB values stay English —
 * they are what `/videos?category=` filters on. Map ONLY at render time.
 */

export const VIDEO_CATEGORY_LABELS: Record<string, string> = {
  review: 'Essai',
  comparison: 'Comparatif',
  news: 'Actualité',
  guide: 'Guide',
  event: 'Événement',
}

/** French category label, falling back to the raw value for anything unmapped. */
export function videoCategoryLabel(value: string | null | undefined): string {
  if (!value) return ''
  return VIDEO_CATEGORY_LABELS[value] ?? value
}
