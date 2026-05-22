import { NarsaCampaign } from '@/components/home/NarsaCampaign'
import { ChallengeMagazine } from '@/components/home/ChallengeMagazine'
import { getLatestMagazine } from '@/lib/data/challenge-magazines'

export async function PromoBanner() {
  const latestIssue = await getLatestMagazine('challenge-auto')

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Two-card row: NARSA (2/3) + Challenge (1/3) on lg+, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-8 lg:gap-y-5 gap-x-4 md:gap-x-5 items-stretch">
          <div className="lg:col-span-2">
            <NarsaCampaign />
          </div>
          <div className="lg:col-span-1">
            <ChallengeMagazine issue={latestIssue} />
          </div>
        </div>
      </div>
    </section>
  )
}
