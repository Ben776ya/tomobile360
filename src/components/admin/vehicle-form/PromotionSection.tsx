'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface PromotionSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function PromotionSection({ register }: PromotionSectionProps) {
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-dark-100">Réduction (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            {...register('promo_percentage')}
            placeholder="0"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
          <p className="text-xs text-dark-300 mt-1">Vide ou 0 = pas de promotion</p>
        </div>
        <div>
          <Label className="text-dark-100">Titre de la promotion</Label>
          <Input
            {...register('promo_title')}
            placeholder="ex: Offre de lancement"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Valide jusqu&apos;au</Label>
          <Input
            type="date"
            {...register('promo_valid_until')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
