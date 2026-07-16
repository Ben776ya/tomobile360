import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Crédit Auto au Maroc — Financement Voiture | SOFAC',
  description: 'Simulez et obtenez votre crédit auto au Maroc avec SOFAC, leader du crédit auto. Financement véhicule neuf ou occasion — réponse rapide.',
  path: '/services/credit',
})

export default function CreditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
