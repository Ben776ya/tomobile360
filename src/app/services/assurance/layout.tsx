import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assurance Auto au Maroc — Comparez les Offres | Tomobile 360',
  description: 'Comparez et souscrivez votre assurance auto au Maroc. Tous risques, au tiers, responsabilité civile.',
}

export default function AssuranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
