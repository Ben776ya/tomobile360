import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendre ma Voiture au Maroc — Déposer une Annonce | Tomobile 360',
  description: "Déposez votre annonce de vente de voiture d'occasion gratuitement sur Tomobile 360, la marketplace automobile au Maroc.",
}

export default function VendreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
