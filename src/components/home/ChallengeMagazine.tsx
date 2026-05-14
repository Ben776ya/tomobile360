import Link from 'next/link'
import Image from 'next/image'
import { Download, ArrowRight } from 'lucide-react'
import type { Magazine } from '@/lib/types'

export function ChallengeMagazine({ issue }: { issue: Magazine | null }) {
  if (!issue) {
    return (
      <div className="h-full bg-[#F2F4F6] rounded-2xl border border-[#F0F2F5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 md:p-6 flex items-center justify-center text-sm text-gray-500">
        Aucun numéro publié pour le moment.
      </div>
    )
  }

  return (
    <div className="relative pt-7 md:pt-9 h-full">
      <div
        className="
          relative h-full bg-[#F2F4F6] rounded-2xl
          border border-[#F0F2F5]
          shadow-[0_2px_8px_rgba(0,0,0,0.06)]
          px-5 py-5 md:px-6 md:py-6
          grid grid-cols-[minmax(0,1fr)_120px] md:grid-cols-[minmax(0,1fr)_140px]
          gap-4 items-center
          min-h-[170px] md:min-h-[190px]
          overflow-visible
        "
      >
        {/* Left — kicker + title + CTAs */}
        <div className="flex flex-col gap-3 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280] leading-none">
            Challenge Auto · N°{issue.issue_number}
          </span>

          <h3
            className="font-display font-extrabold text-[#1C2541] leading-[1.08] tracking-[-0.018em] text-[clamp(17px,1rem+0.7vw,21px)] [text-wrap:balance] m-0"
          >
            Découvrez le dernier numéro de{' '}
            <span className="font-display italic font-extrabold">Challenge auto</span>
          </h3>

          <div className="mt-1 flex items-center gap-3 flex-wrap">
            <Link
              href={issue.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Lire le PDF du numéro ${issue.issue_number}`}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-full bg-[#E84545] hover:bg-[#D63838]
                text-white font-bold text-[13px]
                shadow-[0_6px_16px_rgba(0,0,0,0.10)]
                hover:shadow-[0_10px_22px_rgba(0,0,0,0.14)]
                hover:-translate-y-px active:translate-y-0
                transition-all duration-200
              "
            >
              <Download className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
              <span>Lire le PDF</span>
            </Link>

            <Link
              href="/magazine"
              className="
                inline-flex items-center gap-1.5
                px-1 py-1
                text-[#1C2541] font-semibold text-[12px]
                opacity-[0.85] hover:opacity-100
                transition-opacity duration-200
                group
              "
            >
              <span>Tous les numéros</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right — tilted magazine cover, overflowing the banner top */}
        <div className="relative self-stretch">
          {/* Soft blurred shadow projected onto the banner — lives outside
              the cover's rotation so it can be tuned independently.
              top offset = cover top (-28/-36) + 18px shadow drop. */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              right-[-8px] top-[-10px]
              md:right-[-12px] md:top-[-18px]
              w-[120px] md:w-[140px]
              aspect-[180/245]
              rounded-[12px]
              bg-[rgba(20,28,48,0.28)]
              opacity-55
              blur-[28px]
              [transform:rotate(10deg)]
              [transform-origin:60%_60%]
            "
          />

          {/* Cover itself. Hover transform restates the base rotate(10deg)
              on purpose — CSS replaces transforms wholesale on state change,
              so the hover variant must include the rotation to keep it. */}
          <Link
            href={issue.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ouvrir le PDF du numéro ${issue.issue_number}`}
            className="
              absolute
              right-[-8px] top-[-28px]
              md:right-[-12px] md:top-[-36px]
              w-[120px] md:w-[140px]
              aspect-[180/245]
              rounded-[6px]
              overflow-visible
              [transform:rotate(10deg)]
              [transform-origin:60%_60%]
              transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
              will-change-transform
              hover:[transform:rotate(10deg)_translateY(-2px)]
              block
            "
          >
            {/* Spine darkening on the left edge (subtle paper feel, not white) */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[3px] rounded-l-[4px] pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0) 100%)',
              }}
            />

            <Image
              src={issue.cover_url}
              alt={`Couverture Challenge Auto N°${issue.issue_number} — ${issue.dossier_title}`}
              fill
              sizes="(min-width: 768px) 140px, 120px"
              className="object-cover rounded-[4px] select-none"
              draggable={false}
              priority={false}
              style={{
                // Drop shadows only — no white inset highlight (the "white stripe" we are removing)
                boxShadow:
                  '0 18px 30px rgba(20,28,48,0.22), 0 38px 60px rgba(20,28,48,0.16)',
                WebkitUserDrag: 'none',
              } as React.CSSProperties}
            />

            {/* Diagonal gloss — sells the "physical object on top of the banner" feel */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-[4px] pointer-events-none mix-blend-screen"
              style={{
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 65%)',
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
