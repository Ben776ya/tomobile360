'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { GA_MEASUREMENT_ID, isGAEnabled } from '@/lib/analytics/gtag'
import { hasAnalyticsConsent, CONSENT_CHANGED_EVENT } from '@/lib/analytics/consent'

/**
 * Loads GA4 (gtag.js) site-wide — but ONLY after the visitor accepts cookies
 * (the banner promises no audience-measurement cookie without consent) AND only
 * when NEXT_PUBLIC_GA_MEASUREMENT_ID is set. With no ID or no consent it renders
 * nothing, so every gaEvents.* call no-ops cleanly.
 *
 * Reacts live to the consent banner via a same-tab custom event, so accepting
 * starts analytics without a page reload.
 */
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const sync = () => setConsented(hasAnalyticsConsent())
    sync()
    window.addEventListener(CONSENT_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync)
  }, [])

  if (!isGAEnabled || !consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
