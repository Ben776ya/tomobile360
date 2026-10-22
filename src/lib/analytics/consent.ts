/**
 * Cookie-consent state, shared between the consent banner, the /cookies page,
 * the GA4 loader and the homepage Instagram reels panel.
 *
 * "Accepter" on the banner enables GA4 and the homepage Instagram embeds, which
 * both set their own cookies, so neither may load before the visitor has
 * accepted. This module is the single source of truth for that decision
 * (React components read it through useConsent in ./use-consent).
 *
 * v2 (2026-10-21): the banner now names what "Accepter" enables (GA4 and the
 * Instagram embeds). Choices stored under v1 were given on a banner that said
 * only necessary cookies were used, so they are not carried over: every
 * visitor is asked again.
 */

export const CONSENT_STORAGE_KEY = 'tomobile360-cookie-consent-v2'
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
