import { NarsaCampaign } from '@/components/home/NarsaCampaign'
import { ChallengeMagazine } from '@/components/home/ChallengeMagazine'

export function PromoBanner() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4">
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
