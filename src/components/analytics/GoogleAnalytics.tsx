'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { GA_MEASUREMENT_ID, isGAEnabled } from '@/lib/analytics/gtag'
import { hasAnalyticsConsent, CONSENT_CHANGED_EVENT } from '@/lib/analytics/consent'

/** Expire _ga / _ga_<id> on this host and on the parent domain GA writes them to. */
function deleteGaCookies() {
  const host = window.location.hostname
  const domains = ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim()
    if (name !== '_ga' && !name.startsWith('_ga_')) continue
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`
  }
}

/**
 * Loads GA4 (gtag.js) site-wide — but ONLY after the visitor accepts cookies
 * (the banner promises no audience-measurement cookie without consent) AND only
 * when NEXT_PUBLIC_GA_MEASUREMENT_ID is set. With no ID or no consent it renders
 * nothing, so every gaEvents.* call no-ops cleanly.
 *
 * Reacts live to the consent banner via a same-tab custom event, so accepting
 * starts analytics without a page reload. gtag.js can't be unloaded, so a
 * later refusal (from the /cookies page) sets GA's opt-out flag and deletes
 * its _ga cookies.
 */
export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const sync = () => {
      const ok = hasAnalyticsConsent()
      setConsented(ok)
      if (!isGAEnabled) return
      // GA's documented opt-out flag: gtag stops sending while it is true.
      const flags = window as unknown as Record<string, boolean>
      flags[`ga-disable-${GA_MEASUREMENT_ID}`] = !ok
      if (!ok) deleteGaCookies()
    }
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
