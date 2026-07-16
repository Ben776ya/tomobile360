import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Estimer le Prix de ma Voiture au Maroc',
  description: "Obtenez une estimation gratuite de la valeur de votre voiture d'occasion au Maroc en quelques clics.",
  path: '/occasion/estimation',
})

export default function EstimationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
