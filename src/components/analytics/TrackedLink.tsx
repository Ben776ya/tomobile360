'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics/gtag'

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string
  eventParams?: Record<string, string | number | boolean | undefined>
  children: ReactNode
}

/**
 * A plain <a> that fires a GA4 event on click. Used to instrument inline
 * lead links (WhatsApp, tel:) that live in Server Components and therefore
 * can't carry an onClick themselves. The navigation is untouched — the event
 * is fire-and-forget and never blocks or preventDefaults the click.
 */
export function TrackedLink({ event, eventParams, children, onClick, ...anchorProps }: TrackedLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(e) => {
        trackEvent(event, eventParams)
        onClick?.(e)
      }}
    >
      {children}
    </a>
  )
}
