'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ChevronRight } from 'lucide-react'
import { getLatestIssue } from '@/lib/data/challenge-magazines'

export function ChallengeMagazine() {
  const issue = getLatestIssue()

  return (
    <div className="flex-1 bg-gradient-to-br from-[#F4F5FA] to-white p-5 md:p-6 border-t lg:border-t-0 lg:border-l border-gray-100">
      <div className="flex flex-col sm:flex-row gap-5 md:gap-6 h-full">
        {/* Hero cover */}
        <div className="flex items-center justify-center sm:items-start sm:justify-start shrink-0">
          <Link
            href={issue.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ouvrir le PDF du numéro ${issue.issueNumber} (${issue.issueDate})`}
            className="block group"
          >
            <div className="relative w-full max-w-[150px] aspect-[250/350] rounded-lg overflow-hidden shadow-md ring-1 ring-[#1c2541]/15 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <Image
                src={issue.coverUrl}
                alt={`Couverture Challenge Magazine N°${issue.issueNumber} — ${issue.dossierTitle}`}
                fill
                sizes="(min-width: 1024px) 150px, 140px"
                className="object-cover"
                priority={false}
              />
            </div>
          </Link>
        </div>

        {/* Content stack */}
        <div className="flex-1 flex flex-col">
          <span className="inline-flex items-center self-start gap-2 px-3 py-0.5 rounded-full bg-[#1c2541]/5 text-[#1c2541] text-[11px] font-semibold uppercase tracking-wide mb-3">
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            Magazine Challenge
          </span>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4057aa] mb-1">
            N°{issue.issueNumber} · {issue.issueDate}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-[#1c2541] leading-tight">
            {issue.dossierTitle}
          </h3>
          <span className="block w-12 h-1 bg-[#fad502] rounded-full mt-2 mb-3" aria-hidden="true" />
          <p className="text-sm md:text-[15px] text-gray-600 mb-4">
            {issue.dossierSubtitle}
          </p>

          <ul className="flex flex-wrap gap-1.5 mb-5">
            {issue.tags.map((tag) => (
              <li
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white border border-[#1c2541]/10 text-[10px] font-semibold uppercase tracking-wider text-[#1c2541]"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href={issue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c2541] hover:bg-[#0f1730] text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              Lire le PDF
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/magazine"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#4057aa] hover:text-[#2e3f7a] transition-colors sm:ml-auto"
            >
              Voir tous les numéros
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
