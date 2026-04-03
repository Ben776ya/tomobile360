import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crédit Auto au Maroc — Financement Voiture',
  description: 'Simulez et obtenez votre crédit auto au Maroc. Comparez les offres de financement pour votre voiture neuve ou occasion.',
  alternates: {
    canonical: 'https://tomobile360.ma/services/credit',
  },
}

export default function CreditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
