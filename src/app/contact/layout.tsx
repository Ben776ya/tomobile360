import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contactez Tomobile 360 — Votre Guide Automobile au Maroc',
  description: 'Contactez l\'équipe Tomobile 360 pour toute question sur les voitures neuves au Maroc, nos services ou un partenariat.',
  alternates: {
    canonical: 'https://tomobile360.ma/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
