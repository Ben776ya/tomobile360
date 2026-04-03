import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assurance Auto au Maroc — Comparez les Offres | Tomobile 360',
  description: 'Comparez et souscrivez votre assurance auto au Maroc. Tous risques, au tiers, responsabilité civile.',
  alternates: {
    canonical: 'https://tomobile360.ma/services/assurance',
  },
}

export default function AssuranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
