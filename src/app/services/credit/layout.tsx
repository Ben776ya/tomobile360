import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crédit Auto au Maroc — Financement Voiture | Tomobile 360',
  description: 'Simulez et obtenez votre crédit auto au Maroc. Comparez les offres de financement pour votre voiture neuve ou occasion.',
}

export default function CreditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
