'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VehicleFormValues } from './types'

interface EngineSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function EngineSection({ register }: EngineSectionProps) {
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label className="text-dark-100">Carburant</Label>
          <select
            {...register('fuel_type')}
            className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
          >
            <option value="">--</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybride</option>
            <option value="Electric">Électrique</option>
            <option value="PHEV">PHEV</option>
          </select>
        </div>
        <div>
          <Label className="text-dark-100">Transmission</Label>
          <select
            {...register('transmission')}
            className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
          >
            <option value="">--</option>
            <option value="Manual">Manuelle</option>
            <option value="Automatic">Automatique</option>
            <option value="CVT">CVT</option>
            <option value="DCT">DCT</option>
          </select>
        </div>
        <div>
          <Label className="text-dark-100">Cylindrée (L)</Label>
          <Input
            type="number"
            step="0.1"
            {...register('engine_size')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Cylindres</Label>
          <Input
            type="number"
            {...register('cylinders')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Puissance (ch)</Label>
          <Input
            type="number"
            {...register('horsepower')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Couple (Nm)</Label>
          <Input
            type="number"
            {...register('torque')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">0-100 km/h (s)</Label>
          <Input
            type="number"
            step="0.1"
            {...register('acceleration')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label className="text-dark-100">Vitesse max (km/h)</Label>
          <Input
            type="number"
            {...register('top_speed')}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
          />
        </div>
      </div>
    </div>
  )
}
