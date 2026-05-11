import { NarsaCampaign } from '@/components/home/NarsaCampaign'
import { ChallengeMagazine } from '@/components/home/ChallengeMagazine'

export function PromoBanner() {
  return (
    <section className="py-4 md:py-6 bg-[#565A5D]/10">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-card">
          <div className="flex flex-col lg:flex-row items-stretch">
            <NarsaCampaign />
            <ChallengeMagazine />
          </div>
        </div>
      </div>
    </section>
  )
}
