import type { Metadata } from 'next'
import { getAllMagazines } from '@/lib/data/challenge-magazines'
import { PUBLICATIONS, PUBLICATION_ORDER } from '@/lib/magazines/publications'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { MagazineSection } from '@/components/magazine/MagazineSection'

const BASE_URL = 'https://www.tomobile360.ma'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Magazines automobiles Maroc — Challenge Auto & VH Spéciale Automobile',
  description:
    "Tous les numéros de Challenge Auto et VH Spéciale Automobile en accès libre — magazines automobiles marocains : essais voiture, dossiers du marché, guide d'achat et nouveautés.",
  keywords: [
    'magazine automobile Maroc',
    'Challenge Auto',
    'VH Spéciale Automobile',
    'revue automobile marocaine',
    'PDF magazine auto',
    'actualité automobile Maroc',
    "guide d'achat voiture Maroc",
  ],
  alternates: { canonical: '/magazine' },
  openGraph: {
    title: 'Magazines automobiles Maroc — Challenge Auto & VH Spéciale Automobile',
    description:
      'Téléchargez les derniers numéros de Challenge Auto et VH Spéciale Automobile.',
    url: '/magazine',
    siteName: 'Tomobile 360',
    type: 'website',
  },
}

export default async function MagazineArchivePage() {
  const [challengeIssues, vhIssues] = await Promise.all([
    getAllMagazines('challenge-auto'),
    getAllMagazines('vh-speciale-automobile'),
  ])

  const issuesByPublication = {
    'challenge-auto': challengeIssues,
    'vh-speciale-automobile': vhIssues,
  } as const

  const collectionSchema = {
    '@type': 'CollectionPage',
    name: 'Magazines automobiles Maroc',
    description:
      'Bibliothèque des magazines automobiles Tomobile 360 : Challenge Auto et VH Spéciale Automobile.',
    inLanguage: 'fr-MA',
    url: `${BASE_URL}/magazine`,
    hasPart: PUBLICATION_ORDER.map((slug) => ({
      '@type': 'Periodical',
      name: PUBLICATIONS[slug].displayName,
      url: `${BASE_URL}/magazine#publication-${slug}`,
    })),
  }

  return (
    <main className="bg-white">
      <section className="container mx-auto px-4 py-10 md:py-14">
        <JsonLd data={collectionSchema} />

        <Breadcrumbs items={[{ name: 'Magazines' }]} />

        <header className="max-w-3xl mb-10 md:mb-14">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#DC2626] mb-2">
            Archives
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c2541] leading-tight">
            Magazines automobiles Maroc
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Retrouvez tous les numéros de <strong>Challenge Auto</strong> et de
            {' '}<strong>VH Spéciale Automobile</strong> — actualités du marché,
            essais, dossiers et guides d&apos;achat — en téléchargement PDF
            gratuit.
          </p>
          <nav aria-label="Naviguer entre les publications" className="mt-5 flex flex-wrap gap-2">
            {PUBLICATION_ORDER.map((slug) => (
              <a
                key={slug}
                href={`#publication-${slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={{
                  borderColor: PUBLICATIONS[slug].accentColor,
                  color: PUBLICATIONS[slug].accentColor,
                }}
              >
                {PUBLICATIONS[slug].displayName}
              </a>
            ))}
          </nav>
        </header>

        <div className="flex flex-col gap-14 md:gap-20">
          {PUBLICATION_ORDER.map((slug) => (
            <MagazineSection
              key={slug}
              publication={PUBLICATIONS[slug]}
              issues={issuesByPublication[slug]}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
