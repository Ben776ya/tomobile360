import { pageMetadata } from '@/lib/seo/page-metadata'

export const metadata = pageMetadata({
  title: 'Contactez Tomobile 360 — Votre Guide Automobile au Maroc',
  description: 'Contactez l\'équipe Tomobile 360 pour toute question sur les voitures neuves au Maroc, nos services ou un partenariat.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
