import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crédit Auto au Maroc — Financement Voiture | SOFAC',
  description: 'Simulez et obtenez votre crédit auto au Maroc avec SOFAC, leader du crédit auto. Financement véhicule neuf ou occasion — réponse rapide.',
  alternates: {
    canonical: 'https://tomobile360.ma/services/credit',
  },
}

export default function CreditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
