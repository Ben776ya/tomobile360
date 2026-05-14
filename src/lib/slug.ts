/**
 * Canonical brand/model URL slug.
 *
 * - lowercase
 * - strip Unicode combining diacritics (NFD-decompose, drop U+0300..U+036F)
 * - collapse any non-alphanumeric run to a single dash
 * - trim leading/trailing dashes
 *
 * Examples:
 *   slug('Citroën')     === 'citroen'
 *   slug('Série 3')     === 'serie-3'
 *   slug('Land Rover')  === 'land-rover'
 *   slug('CS35+')       === 'cs35'
 *   slug('500C')        === '500c'
 *
 * Identical logic to scripts/curated-images/audit-mapping.mjs:slug() so
 * storage paths and URL slugs stay aligned.
 */
export function slug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
