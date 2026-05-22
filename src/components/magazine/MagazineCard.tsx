import Link from 'next/link'
import Image from 'next/image'
import { Download } from 'lucide-react'
import type { Magazine } from '@/lib/types'
import { PUBLICATIONS } from '@/lib/magazines/publications'

export function MagazineCard({ issue }: { issue: Magazine }) {
  const publication = PUBLICATIONS[issue.publication]
  return (
    <li className="flex flex-col">
      <Link
        href={issue.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ouvrir le PDF du numéro ${issue.issue_number} de ${publication.displayName}`}
        className="relative block group"
      >
        <div className="relative w-full aspect-[250/350] rounded-lg overflow-hidden ring-1 ring-[#1c2541]/15 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg bg-gray-100">
          <Image
            src={issue.cover_url}
            alt={`Couverture ${publication.displayName} N°${issue.issue_number} — ${issue.dossier_title}`}
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
          className="mt-1 self-start inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: publication.accentColor }}
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Lire le PDF
        </Link>
      </div>
    </li>
  )
}
