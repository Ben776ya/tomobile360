import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Estimer le Prix de ma Voiture au Maroc | Tomobile 360',
  description: "Obtenez une estimation gratuite de la valeur de votre voiture d'occasion au Maroc en quelques clics.",
}

export default function EstimationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
