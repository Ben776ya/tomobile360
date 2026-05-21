'use client'

import { useFormContext } from 'react-hook-form'
import type { BlogPostFormValues } from './types'

export function PublishingSection() {
  const { register } = useFormContext<BlogPostFormValues>()

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Publication</h3>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('featured')}
          className="rounded border-white/10 h-4 w-4"
        />
        <span className="text-sm text-dark-100">
          Mettre en vedette (affiché en héro sur la page Actu)
        </span>
      </label>
    </div>
  )
}
