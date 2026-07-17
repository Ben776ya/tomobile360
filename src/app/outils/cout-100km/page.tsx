import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageMetadata } from '@/lib/seo/page-metadata'
import { getEnergyRates } from '@/lib/data/energy-rates'
import { Cout100kmCalculator } from '@/components/outils/Cout100kmCalculator'

// Rates change rarely; refresh the server-fetched prices roughly hourly.
export const revalidate = 3600

const CANONICAL_URL = 'https://www.tomobile360.ma/outils/cout-100km'

export const metadata = pageMetadata({
  title: 'Combien coûte 100 km au Maroc : essence vs hybride vs électrique',
  description:
    'Comparez le coût réel de 100 km au Maroc entre essence, diesel, hybride et électrique. Estimez votre budget énergie annuel selon votre consommation et vos kilomètres.',
  path: '/outils/cout-100km',
  images: ['/og-image.png'],
})

export default async function Cout100kmPage() {
  const { rates, effectiveDate, isFallback } = await getEnergyRates()

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@type': 'WebApplication',
          name: 'Calculateur coût au 100 km',
          url: CANONICAL_URL,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          inLanguage: 'fr',
          description:
            "Outil de comparaison du coût de 100 km au Maroc entre motorisations essence, diesel, hybride et électrique, en dirhams.",
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'MAD' },
          publisher: { '@type': 'Organization', name: 'Tomobile 360' },
        }}
      />

      <div className="container mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ name: 'Outils' }, { name: 'Coût au 100 km' }]} />
      </div>

      <section className="pb-16 md:pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Combien coûte 100 km au Maroc ?
            </h1>
            {/* Server-rendered factual tool description (UI copy). */}
            <p className="mt-3 text-gray-500 leading-relaxed">
              Cet outil compare le coût de 100 km entre une motorisation essence, diesel, hybride et
              électrique, en dirhams. Saisissez la consommation de chaque énergie et votre distance
              annuelle pour estimer le coût aux 100 km et le budget énergie sur un an. Les tarifs
              sont modifiables et pré-remplis avec des prix moyens au Maroc.
            </p>
          </header>

          <Suspense
            fallback={<div className="min-h-[420px] rounded-2xl border border-gray-200 bg-white" />}
          >
            <Cout100kmCalculator initialRates={rates} effectiveDate={effectiveDate} isFallback={isFallback} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
