'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { getLatestIssue } from '@/lib/data/challenge-magazines'

export function ChallengeMagazine() {
  const issue = getLatestIssue()

  return (
    <div className="h-full bg-[#F4F5F8] rounded-2xl border border-gray-200/70 p-5 md:p-6">
      <div className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[130px_minmax(0,1fr)] gap-4 md:gap-5 items-center h-full">
        {/* Cover with EXCLUSIF sticker */}
        <Link
          href={issue.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ouvrir le PDF du numéro ${issue.issueNumber}`}
          className="relative block group shrink-0"
        >
          <div className="relative w-full aspect-[250/350] rounded-lg overflow-hidden ring-1 ring-[#1c2541]/15 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <Image
              src={issue.coverUrl}
              alt={`Couverture Challenge Magazine N°${issue.issueNumber} — ${issue.dossierTitle}`}
              fill
              sizes="130px"
              className="object-cover"
              priority={false}
            />
          </div>
          <span className="absolute -top-1 -right-1 rotate-6 bg-[#DC2626] text-white px-2 py-1 rounded shadow-md ring-1 ring-white">
            <span className="block text-[8px] font-bold uppercase tracking-wider leading-tight text-center">
              Exclusif
            </span>
            <span className="block text-[10px] font-extrabold leading-tight text-center">
              N°{issue.issueNumber}
            </span>
          </span>
        </Link>

        {/* Content */}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-[#FCE7E7] text-[#1c2541] text-[10px] font-bold uppercase tracking-wider">
            Magazine Challenge
          </span>
          <h3 className="text-lg md:text-xl font-extrabold text-[#1c2541] leading-tight">
            Le dernier numéro<br />est paru
          </h3>
          <p className="text-[13px] font-semibold text-[#1c2541] mt-0.5">
            N°{issue.issueNumber} <span className="text-gray-400">·</span> {issue.issueDate}
          </p>
          <p className="text-[12px] text-[#7B6AB4] font-medium leading-snug">
            Dossier : {issue.dossierTitle.toLowerCase()}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={issue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-full transition-colors duration-300 text-sm shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Lire le PDF
            </Link>
            <Link
              href="/magazine"
              className="text-[12px] font-semibold text-gray-500 hover:text-[#1c2541] transition-colors whitespace-nowrap"
            >
              Tous les numéros →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
