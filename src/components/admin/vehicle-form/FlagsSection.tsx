'use client'

import type { UseFormRegister } from 'react-hook-form'
import type { VehicleFormValues } from './types'

interface FlagsSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function FlagsSection({ register }: FlagsSectionProps) {
  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Tags et statut</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_available')}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Disponible</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_popular')}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Populaire</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_new_release')}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Nouveauté</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_coming_soon')}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Bientôt disponible</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_featured_offer')}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Offre Spéciale</span>
        </label>
      </div>
    </div>
  )
}
