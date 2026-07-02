/**
 * Curated list of article authors for /actu blog posts — single source of truth.
 * Add a name here to make it selectable in the admin article form.
 */
export const BLOG_AUTHORS = [
  'Rédaction Tomobile360',
  'Tomobile360',
] as const

export type BlogAuthor = (typeof BLOG_AUTHORS)[number]

/** Default author applied to a new article. */
export const DEFAULT_AUTHOR: string = 'Rédaction Tomobile360'

/** True when `value` is one of the curated authors. */
export function isKnownAuthor(value: string): boolean {
  return (BLOG_AUTHORS as readonly string[]).includes(value)
}
