import { useEffect, useState } from 'react'
import { CONSENT_CHANGED_EVENT, readConsent, type ConsentValue } from './consent'

/**
 * The visitor's cookie choice, kept in sync with later changes (banner or
 * /cookies page). `undefined` until mounted, so the server and first client
 * render agree. Kept out of ./consent so server components can import its
 * constants.
 */
export function useConsent(): ConsentValue | null | undefined {
  const [value, setValue] = useState<ConsentValue | null | undefined>(undefined)
  useEffect(() => {
    const sync = () => setValue(readConsent())
    sync()
    window.addEventListener(CONSENT_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync)
  }, [])
  return value
}
