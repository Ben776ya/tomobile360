import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Comparateur de Voitures Neuves au Maroc',
  description: 'Comparez côte à côte les voitures neuves disponibles au Maroc. Specs, prix et équipements pour faire le meilleur choix.',
  path: '/neuf/comparer',
})

export default function ComparerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
