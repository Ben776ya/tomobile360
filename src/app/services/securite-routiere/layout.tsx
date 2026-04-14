import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sécurité Routière au Maroc — Capsules Vidéo & Conseils | NARSA',
  description: 'Regardez les capsules vidéo de sensibilisation à la sécurité routière de la NARSA : piétons, motos, distance de sécurité, signalisation et plus. Conseils pratiques pour les routes du Maroc.',
  alternates: {
    canonical: 'https://tomobile360.ma/services/securite-routiere',
  },
  openGraph: {
    title: 'Sécurité Routière au Maroc — Capsules Vidéo NARSA',
    description: 'Capsules vidéo de sensibilisation à la sécurité routière : piétons, motos, taxis, signalisation. Produites par la NARSA et MFM Radio.',
    url: 'https://tomobile360.ma/services/securite-routiere',
    type: 'website',
    images: [
      {
        url: 'https://tomobile360.ma/narsa_logo.png',
        alt: 'NARSA — Agence Nationale de la Sécurité Routière',
      },
    ],
  },
}

export default function SecuriteRoutiereLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
