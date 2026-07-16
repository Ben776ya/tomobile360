import type { Magazine } from '@/lib/types'
import type { Publication } from '@/lib/magazines/publications'
import { JsonLd } from '@/components/seo/JsonLd'
import { MagazineCard } from './MagazineCard'

const BASE_URL = 'https://www.tomobile360.ma'

export function MagazineSection({
  publication,
  issues,
}: {
  publication: Publication
  issues: Magazine[]
}) {
  const sectionId = `publication-${publication.slug}`

  const periodicalSchema = {
    '@type': 'Periodical',
    name: publication.displayName,
    description: publication.seoDescription,
    inLanguage: 'fr-MA',
    keywords: publication.seoKeywords.join(', '),
    url: `${BASE_URL}/magazine#${sectionId}`,
    hasPart: issues.map((issue) => ({
      '@type': 'PublicationIssue',
      issueNumber: issue.issue_number,
      datePublished: issue.issue_date ?? undefined,
      name: `${publication.displayName} N°${issue.issue_number} — ${issue.dossier_title}`,
      url: issue.pdf_url,
      image: issue.cover_url,
      isPartOf: { '@type': 'Periodical', name: publication.displayName },
    })),
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className="scroll-mt-24"
    >
      <JsonLd data={periodicalSchema} />

      <header className="max-w-3xl mb-6 md:mb-8">
        <p
          className="text-[12px] font-bold uppercase tracking-wider mb-2"
          style={{ color: publication.accentColor }}
        >
          {publication.displayName}
        </p>
        <h2
          id={`${sectionId}-heading`}
          className="text-2xl md:text-3xl font-extrabold text-[#1c2541] leading-tight"
        >
          Tous les numéros de {publication.displayName}
        </h2>
        <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
          {publication.tagline}
        </p>
      </header>

      {issues.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun numéro publié pour le moment.
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {issues.map((issue) => (
            <MagazineCard key={issue.id} issue={issue} />
          ))}
        </ul>
      )}
    </section>
  )
}
