import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Assurance Auto au Maroc — Comparez les Offres',
  description: 'Comparez et souscrivez votre assurance auto au Maroc. Tous risques, au tiers, responsabilité civile.',
  path: '/services/assurance',
})

export default function AssuranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
