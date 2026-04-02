import type { Metadata, Viewport } from 'next'
import { Sora, Montserrat_Alternates } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

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
  title: 'Tomobile 360 - Marketplace Automobile au Maroc',
  description: 'Trouvez votre voiture neuve ou d\'occasion au Maroc. Comparez les prix, consultez les avis, et contactez les vendeurs.',
  openGraph: {
    title: 'Tomobile 360 - Marketplace Automobile au Maroc',
    description: 'Trouvez votre voiture neuve ou d\'occasion au Maroc. Comparez les prix, consultez les avis, et contactez les vendeurs.',
    url: 'https://tomobile360.ma',
    siteName: 'Tomobile 360',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tomobile 360 - Marketplace Automobile au Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tomobile 360 - Marketplace Automobile au Maroc',
    description: 'Trouvez votre voiture neuve ou d\'occasion au Maroc.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${sora.variable} ${montserratAlternates.variable}`}>
      <body className={sora.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Tomobile 360',
                  url: 'https://tomobile360.ma',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://tomobile360.ma/neuf?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  name: 'Tomobile 360',
                  url: 'https://tomobile360.ma',
                  logo: 'https://tomobile360.ma/logo_tomobil360.png',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+212-522-123456',
                    contactType: 'customer service',
                    availableLanguage: 'French',
                  },
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '123 Boulevard Mohammed V',
                    addressLocality: 'Casablanca',
                    postalCode: '20250',
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
