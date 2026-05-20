'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface PricingSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function PricingSection({ register }: PricingSectionProps) {
  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Prix</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priceMin" className="text-dark-100">Prix minimum (DH)</Label>
          <Input
            id="priceMin"
            type="number"
            {...register('price_min')}
            placeholder="ex: 150000"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="priceMax" className="text-dark-100">Prix maximum (DH)</Label>
          <Input
            id="priceMax"
            type="number"
            {...register('price_max')}
            placeholder="ex: 250000"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
