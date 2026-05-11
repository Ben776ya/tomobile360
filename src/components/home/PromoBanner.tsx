import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NarsaCampaign } from '@/components/home/NarsaCampaign'
import { ChallengeMagazine } from '@/components/home/ChallengeMagazine'

export function PromoBanner() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 mb-4 md:mb-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1c2541] leading-tight">
            Sécurité routière{' '}
            <span className="text-gray-300">·</span>{' '}
            Magazine Challenge
          </h2>
          <Link
            href="/magazine"
            className="hidden sm:inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1c2541] hover:text-[#4057aa] transition-colors"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Two-card row: NARSA (2/3) + Challenge (1/3) on lg+, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
          <div className="lg:col-span-2">
            <NarsaCampaign />
          </div>
          <div className="lg:col-span-1">
            <ChallengeMagazine />
          </div>
        </div>
      </div>
    </section>
  )
}
