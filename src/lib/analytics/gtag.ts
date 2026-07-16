/**
 * GA4 event tracking — thin wrapper over gtag.
 *
 * The measurement ID is read from NEXT_PUBLIC_GA_MEASUREMENT_ID. When it is
 * absent (local dev, or before the property is provisioned) the loader renders
 * nothing and every helper below is a safe no-op — no errors, no console noise.
 *
 * These events are management KPI #2 (leads: test drive / quote / estimation /
 * WhatsApp). Keep event names stable once live — renaming resets GA4 reports.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

export const isGAEnabled = GA_MEASUREMENT_ID.length > 0

type GtagParams = Record<string, string | number | boolean | undefined>

/** Fire a raw GA4 event. Safe to call anywhere — no-ops off the browser or when gtag isn't loaded. */
export function trackEvent(name: string, params: GtagParams = {}): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') return
  // Drop undefined params so GA4 doesn't record empty dimensions.
  const clean: GtagParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') clean[k] = v
  }
  gtag('event', name, clean)
}

/** Named lead events. Each maps to one KPI conversion. */
export const gaEvents = {
  whatsappClick: (params: { brand?: string; model?: string; context?: string }) =>
    trackEvent('whatsapp_click', params),
  testDriveRequest: (params: { vehicle?: string }) =>
    trackEvent('test_drive_request', params),
  dealerContact: (params: { vehicle?: string }) =>
    trackEvent('dealer_contact', params),
  estimationRequest: (params: { brand?: string; model?: string; year?: number }) =>
    trackEvent('estimation_request', params),
  newsletterSignup: (params: { context?: string } = {}) =>
    trackEvent('newsletter_signup', params),
}
