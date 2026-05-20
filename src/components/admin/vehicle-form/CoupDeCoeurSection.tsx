'use client'

import type { UseFormRegister } from 'react-hook-form'
import type { VehicleFormValues } from './types'

interface CoupDeCoeurSectionProps {
  register: UseFormRegister<VehicleFormValues>
}

export function CoupDeCoeurSection({ register }: CoupDeCoeurSectionProps) {
  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Coup de Cœur</h3>
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-1">
          Raison éditoriale
          <span className="text-dark-400 font-normal ml-1">(affiché sur la page d&apos;accueil)</span>
        </label>
        <textarea
          {...register('coup_de_coeur_reason')}
          rows={3}
          placeholder="Ex: Meilleur rapport qualité/prix du segment, finition exemplaire..."
          className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-dark-400 text-sm focus:outline-none focus:border-secondary resize-none"
        />
      </div>
    </div>
  )
}
