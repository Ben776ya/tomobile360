import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contactez-Nous | Tomobile 360',
  description: 'Contactez l\'équipe Tomobile 360 pour toute question sur la plateforme, vos annonces ou nos services automobiles au Maroc.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
