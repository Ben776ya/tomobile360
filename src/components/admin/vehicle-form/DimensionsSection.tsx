'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface DimensionsSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function DimensionsSection({ register }: DimensionsSectionProps) {
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label className="text-dark-100">Longueur</Label>
          <Input
            type="number"
            {...register('dim_length')}
            placeholder="ex: 4500"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Largeur</Label>
          <Input
            type="number"
            {...register('dim_width')}
            placeholder="ex: 1800"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Hauteur</Label>
          <Input
            type="number"
            {...register('dim_height')}
            placeholder="ex: 1500"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Empattement</Label>
          <Input
            type="number"
            {...register('dim_wheelbase')}
            placeholder="ex: 2700"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
