'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CONSENT_CHANGED_EVENT, CONSENT_STORAGE_KEY, setConsent } from '@/lib/analytics/consent'

export function CookieConsent() {
  const [decided, setDecided] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      setDecided(stored !== null)
    } catch {
      setDecided(true)
    }
    // A choice made on the /cookies page closes the banner too.
    const close = () => setDecided(true)
    window.addEventListener(CONSENT_CHANGED_EVENT, close)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, close)
  }, [])

  function accept() {
    setConsent('accepted')
    setDecided(true)
  }

  function refuse() {
    setConsent('refused')
    setDecided(true)
  }

  if (decided === null || decided === true) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement cookies"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:bottom-6 md:right-auto md:max-w-md z-50 rounded-lg bg-dark-800 text-white shadow-2xl border border-white/10 p-4 backdrop-blur"
    >
      <p className="text-sm leading-relaxed mb-3">
        Avec votre accord, nous mesurons l&apos;audience avec Google Analytics
        et affichons les reels Instagram de la page d&apos;accueil : ces deux
        services déposent leurs propres cookies. Si vous refusez, Google
        Analytics n&apos;est pas chargé et les reels ne s&apos;affichent que si
        vous le demandez. Vous pouvez changer d&apos;avis à tout moment sur la
        page{' '}
        <Link href="/cookies" className="underline text-secondary">
          politique cookies
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 bg-secondary hover:bg-secondary-600 text-white font-semibold rounded-md py-2 text-sm transition-colors"
        >
          Accepter
        </button>
        <button
          onClick={refuse}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md py-2 text-sm transition-colors"
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
