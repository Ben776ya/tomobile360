'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface EfficiencySectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function EfficiencySection({ register }: EfficiencySectionProps) {
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label className="text-dark-100">Ville (L/100km)</Label>
          <Input
            type="number"
            step="0.1"
            {...register('fuel_consumption_city')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Autoroute (L/100km)</Label>
          <Input
            type="number"
            step="0.1"
            {...register('fuel_consumption_highway')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Mixte (L/100km)</Label>
          <Input
            type="number"
            step="0.1"
            {...register('fuel_consumption_combined')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">CO2 (g/km)</Label>
          <Input
            type="number"
            {...register('co2_emissions')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
