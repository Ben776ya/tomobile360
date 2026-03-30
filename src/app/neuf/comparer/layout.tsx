import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comparateur de Voitures Neuves au Maroc | Tomobile 360',
  description: 'Comparez côte à côte les voitures neuves disponibles au Maroc. Specs, prix et équipements pour faire le meilleur choix.',
}

export default function ComparerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
