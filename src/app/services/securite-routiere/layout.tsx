import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sécurité Routière au Maroc — Conseils & Actualités | NARSA',
  description: 'Découvrez les conseils de sécurité routière, les actualités et les vidéos de sensibilisation de la NARSA — Agence Nationale de la Sécurité Routière du Maroc.',
  alternates: {
    canonical: 'https://tomobile360.ma/services/securite-routiere',
  },
}

export default function SecuriteRoutiereLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
