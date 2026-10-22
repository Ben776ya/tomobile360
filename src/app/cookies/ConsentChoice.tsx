'use client'

import { setConsent } from '@/lib/analytics/consent'
import { useConsent } from '@/lib/analytics/use-consent'

const STATUS = {
  accepted: 'Vous avez accepté Google Analytics, les reels Instagram et les vidéos intégrées.',
  refused: 'Vous avez refusé Google Analytics, les reels Instagram et les vidéos intégrées.',
  none: "Vous n'avez pas encore fait de choix.",
}

/** Current cookie choice with buttons to change it (same storage as the banner). */
export function ConsentChoice() {
  const choice = useConsent()
  const button =
    'px-4 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2'

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-gray-600 mb-3 min-h-[1.5rem]" aria-live="polite">
        {choice !== undefined && STATUS[choice ?? 'none']}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          aria-pressed={choice === 'accepted'}
          className={`${button} bg-secondary text-white hover:bg-secondary-600`}
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => setConsent('refused')}
          aria-pressed={choice === 'refused'}
          className={`${button} bg-white text-gray-700 border border-gray-300 hover:bg-gray-100`}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
