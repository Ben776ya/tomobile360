import type { Metadata, Viewport } from 'next'
import { Sora, Montserrat_Alternates } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { safeJsonLd } from '@/lib/utils'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const montserratAlternates = Montserrat_Alternates({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat-alternates',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tomobile360.ma'),
  title: {
    default: 'Tomobile 360 — Guide d\'Achat Automobile au Maroc : Voitures Neuves, Prix et Fiches Techniques',
    template: '%s | Tomobile 360',
  },
  description: 'Découvrez les prix et fiches techniques de toutes les voitures neuves au Maroc. Comparatifs, essais vidéo et guide d\'achat complet sur Tomobile 360.',
  openGraph: {
    title: 'Tomobile 360 — Guide d\'Achat Automobile au Maroc',
    description: 'Découvrez les prix et fiches techniques de toutes les voitures neuves au Maroc. Comparatifs, essais vidéo et guide d\'achat complet sur Tomobile 360.',
    url: 'https://tomobile360.ma',
    siteName: 'Tomobile 360',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tomobile 360 — Guide d\'Achat Automobile au Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tomobile 360 — Guide d\'Achat Automobile au Maroc',
    description: 'Découvrez les prix et fiches techniques de toutes les voitures neuves au Maroc.',
    images: ['/og-image.png'],
  },
  alternates: {
    languages: {
      'fr-MA': 'https://tomobile360.ma',
      'fr': 'https://tomobile360.ma',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${sora.variable} ${montserratAlternates.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://tomobile360.ma/#website',
                  name: 'Tomobile 360',
                  url: 'https://tomobile360.ma',
                  inLanguage: 'fr-MA',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://tomobile360.ma/neuf?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'AutoDealer',
                  '@id': 'https://tomobile360.ma/#organization',
                  name: 'Tomobile 360',
                  url: 'https://tomobile360.ma',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://tomobile360.ma/logo_tomobil360.png',
                  },
                  email: 'contact@tomobile360.ma',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    email: 'contact@tomobile360.ma',
                    availableLanguage: 'French',
                  },
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Casablanca',
                    addressCountry: 'MA',
                  },
                },
              ],
            }),
          }}
        />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
