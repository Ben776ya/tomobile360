import Link from 'next/link'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { getAllMagazines } from '@/lib/data/challenge-magazines'

export const revalidate = 60

export const metadata = {
  title: 'Archives Challenge Auto — Tomobile 360',
  description:
    'Tous les numéros du Challenge Auto en accès libre — actualités auto, dossiers, essais et tendances du marché marocain.',
}

export default async function MagazineArchivePage() {
  const magazines = await getAllMagazines()

  return (
    <main className="bg-white">
      <section className="container mx-auto px-4 py-10 md:py-14">
        <header className="max-w-3xl mb-8 md:mb-10">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#DC2626] mb-2">
            Archives
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c2541] leading-tight">
            Tous les numéros du Challenge Auto
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Du plus récent au plus ancien — téléchargez chaque numéro en PDF.
          </p>
        </header>

        {magazines.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun numéro publié pour le moment.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {magazines.map((issue) => (
              <li key={issue.id} className="flex flex-col">
                <Link
                  href={issue.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ouvrir le PDF du numéro ${issue.issue_number}`}
                  className="relative block group"
                >
                  <div className="relative w-full aspect-[250/350] rounded-lg overflow-hidden ring-1 ring-[#1c2541]/15 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg bg-gray-100">
                    <Image
                      src={issue.cover_url}
                      alt={`Couverture Challenge Magazine N°${issue.issue_number} — ${issue.dossier_title}`}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="mt-3 flex flex-col gap-1">
                  <p className="text-sm font-bold text-[#1c2541]">
                    N°{issue.issue_number}
                    {issue.issue_date ? (
                      <>
                        {' '}<span className="text-gray-400 font-medium">·</span>{' '}
                        <span className="font-medium text-gray-600">{issue.issue_date}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-[13px] text-gray-700 leading-snug line-clamp-2">
                    {issue.dossier_title}
                  </p>
                  <Link
                    href={issue.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Lire le PDF
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
