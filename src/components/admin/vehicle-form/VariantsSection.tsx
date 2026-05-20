'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import type { VehicleFormValues } from './types'

export function VariantsSection() {
  const { control, register } = useFormContext<VehicleFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variant_list',
  })

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Versions / Variantes</h3>
        <Button
          type="button"
          onClick={() =>
            append({
              version: '',
              price_min: null,
              price_max: null,
              horsepower: null,
              fuel_type: null,
              transmission: null,
            })
          }
          variant="outline"
          size="sm"
          className="border-white/10 bg-dark-700/80 text-dark-100 hover:bg-dark-600/50"
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une version
        </Button>
      </div>
      <p className="text-xs text-dark-400 mb-4">
        Liste des versions/finitions de ce modèle. Affiché dans la colonne &quot;Versions disponibles&quot; de la page produit.
        Laissez vide si le modèle n&apos;a qu&apos;une seule version.
      </p>
      {fields.length === 0 ? (
        <p className="text-sm text-dark-400 italic">Aucune version supplémentaire.</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-dark-800/40 border border-white/5 rounded-md p-3"
            >
              <div className="md:col-span-4">
                <Label className="text-xs text-dark-300">Nom de la version</Label>
                <Input
                  {...register(`variant_list.${i}.version` as const)}
                  placeholder="ex: GT Line"
                  className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-dark-300">Prix min (DH)</Label>
                <Input
                  type="number"
                  {...register(`variant_list.${i}.price_min` as const, {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
                  })}
                  className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-dark-300">Prix max (DH)</Label>
                <Input
                  type="number"
                  {...register(`variant_list.${i}.price_max` as const, {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
                  })}
                  className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
                />
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs text-dark-300">CV</Label>
                <Input
                  type="number"
                  {...register(`variant_list.${i}.horsepower` as const, {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
                  })}
                  className="mt-1 bg-dark-700/80 border-white/10 text-white focus:ring-secondary/50"
                />
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs text-dark-300">Carb.</Label>
                <select
                  {...register(`variant_list.${i}.fuel_type` as const, {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? null : v),
                  })}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-2 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                >
                  <option value="">—</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                  <option value="PHEV">PHEV</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs text-dark-300">Boîte</Label>
                <select
                  {...register(`variant_list.${i}.transmission` as const, {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? null : v),
                  })}
                  className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-2 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
                >
                  <option value="">—</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>
              <div className="md:col-span-1 flex items-end justify-end">
                <Button
                  type="button"
                  onClick={() => remove(i)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  aria-label="Supprimer cette version"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
