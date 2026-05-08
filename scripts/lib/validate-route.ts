const ROUTE_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/actu$/,
  /^\/actu\/[^\/]+$/,
  /^\/neuf$/,
  /^\/neuf\/[^\/]+$/,
  /^\/neuf\/[^\/]+\/[^\/]+$/,
  /^\/occasion$/,
  /^\/services$/,
  /^\/services\/[^\/]+$/,
  /^\/videos$/,
  /^\/videos\/[^\/]+$/,
  /^\/auteurs$/,
  /^\/auteurs\/[^\/]+$/,
  /^\/qui-sommes-nous$/,
  /^\/contact$/,
  /^\/coups-de-coeur$/,
  /^\/forum$/,
  /^\/mentions-legales$/,
  /^\/confidentialite$/,
  /^\/conditions$/,
  /^\/cookies$/,
]

export type ValidationResult = {
  isInternal: boolean
  valid: boolean
  reason?: string
}

export function validateInternalHref(rawHref: string): ValidationResult {
  if (!rawHref) return { isInternal: false, valid: true }

  // Skip protocol-relative, absolute URLs, mailto, tel, hash-only, query-only, relative paths
  if (
    rawHref.startsWith('http://') ||
    rawHref.startsWith('https://') ||
    rawHref.startsWith('//') ||
    rawHref.startsWith('mailto:') ||
    rawHref.startsWith('tel:') ||
    rawHref.startsWith('#') ||
    rawHref.startsWith('?') ||
    !rawHref.startsWith('/')
  ) {
    return { isInternal: false, valid: true }
  }

  // Strip query string and fragment
  let path = rawHref.split('#')[0].split('?')[0]

  // Strip trailing slash (except for root)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  // Normalize case for matching (paths in this app are all lowercase)
  const normalized = path.toLowerCase()

  const matched = ROUTE_PATTERNS.some((pattern) => pattern.test(normalized))
  if (matched) return { isInternal: true, valid: true }

  return {
    isInternal: true,
    valid: false,
    reason: `No route pattern matches "${path}"`,
  }
}
