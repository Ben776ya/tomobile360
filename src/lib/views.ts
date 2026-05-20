// Display helper for views counters. Hides counts below a public threshold
// so brand-new articles/vehicles don't ship with "0 vues".

const PUBLIC_THRESHOLD = 5

export function formatViewsLabel(views: number | null | undefined): string | null {
  const n = typeof views === 'number' ? views : 0
  if (n < PUBLIC_THRESHOLD) return null
  return `${n.toLocaleString('fr-FR')} vues`
}
