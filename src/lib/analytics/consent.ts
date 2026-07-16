/**
 * Cookie-consent state, shared between the consent banner and the GA4 loader.
 *
 * The site's cookie banner promises that NO audience-measurement cookie is set
 * without explicit consent, so GA4 must only load once the visitor has
 * accepted. This module is the single source of truth for that decision.
 *
 * The storage key is unchanged from the banner's original value so existing
 * visitors keep their prior choice.
 */

export const CONSENT_STORAGE_KEY = 'tomobile360-cookie-consent-v1'
export const CONSENT_CHANGED_EVENT = 'tomobile360-consent-changed'

export type ConsentValue = 'accepted' | 'refused'

export function readConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY)
    return v === 'accepted' || v === 'refused' ? v : null
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'accepted'
}

/** Persist the decision and notify listeners (the GA loader) in the same tab. */
export function setConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value)
  } catch {
    /* storage unavailable — nothing to persist */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }))
  }
}
