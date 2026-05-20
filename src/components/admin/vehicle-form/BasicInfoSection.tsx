'use client'

import type { Control, UseFormRegister } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Brand, Model } from '@/lib/types'
import type { VehicleFormValues } from './types'

interface BasicInfoSectionProps {
  control: Control<VehicleFormValues>
  register: UseFormRegister<VehicleFormValues>
  brands: Brand[]
  filteredModels: Model[]
  defaultBrandId?: string
  defaultModelId?: string
  /** Called when the user picks a different brand so the orchestrator can reset model_id. */
  onBrandChange?: () => void
}

export function BasicInfoSection({
  control,
  register,
  brands,
  filteredModels,
  defaultBrandId,
  defaultModelId,
  onBrandChange,
}: BasicInfoSectionProps) {
  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!defaultBrandId && (
          <div>
            <Label htmlFor="brand" className="text-dark-100">Marque *</Label>
            <Controller
              control={control}
              name="brand_id"
              render={({ field }) => (
                <select
                  id="brand"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    onBrandChange?.()
                  }}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                  required
                >
                  <option value="">Sélectionner une marque</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}
        {!defaultModelId && (
          <div>
            <Label htmlFor="model" className="text-dark-100">Modèle *</Label>
            <Controller
              control={control}
              name="model_id"
              render={({ field }) => (
                <select
                  id="model"
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                  required
                  disabled={filteredModels.length === 0}
                >
                  <option value="">Sélectionner un modèle</option>
                  {filteredModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}
        <div>
          <Label htmlFor="version" className="text-dark-100">Version</Label>
          <Input
            id="version"
            {...register('version')}
            placeholder="ex: GT Line, Active..."
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="year" className="text-dark-100">Année *</Label>
          <Input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })}
            min={1990}
            max={2030}
            className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
            required
          />
        </div>
      </div>
    </div>
  )
}
