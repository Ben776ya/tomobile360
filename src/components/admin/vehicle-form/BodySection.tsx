'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface BodySectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function BodySection({ register }: BodySectionProps) {
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-dark-100">Portes</Label>
          <Input type="number" {...register('doors')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Places</Label>
          <Input type="number" {...register('seating_capacity')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Coffre (L)</Label>
          <Input type="number" {...register('cargo_capacity')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Couleur extérieure</Label>
          <Input {...register('exterior_color')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Couleur intérieure</Label>
          <Input {...register('interior_color')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Garantie (mois)</Label>
          <Input type="number" {...register('warranty_months')} className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50" />
        </div>
        <div>
          <Label className="text-dark-100">Norme Euro</Label>
          <select
            {...register('euro_norm')}
            className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
          >
            <option value="">--</option>
            <option value="Euro 3">Euro 3</option>
            <option value="Euro 4">Euro 4</option>
            <option value="Euro 5">Euro 5</option>
            <option value="Euro 6">Euro 6</option>
            <option value="Euro 6d">Euro 6d</option>
            <option value="Euro 7">Euro 7</option>
          </select>
        </div>
        <div>
          <Label className="text-dark-100">Kilométrage</Label>
          <Input
            type="number"
            {...register('mileage')}
            placeholder="0 pour neuf"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
