'use client'

import { useController, useFormContext } from 'react-hook-form'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BlogPostFormValues } from './types'

export function HeroImageSection() {
  const { control, register } = useFormContext<BlogPostFormValues>()

  // ImageUploader is a controlled component (currentUrl + onUpload). Bind it
  // through a Controller-like adapter so the field participates in form state.
  const {
    field: { value: heroImageUrl, onChange: setHeroImageUrl },
  } = useController({
    control,
    name: 'hero_image_url',
  })

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Image à la une</h3>
      <ImageUploader
        currentUrl={heroImageUrl}
        onUpload={setHeroImageUrl}
        label="Image principale"
      />
      <div className="mt-4">
        <Label htmlFor="heroCaption" className="text-dark-100">
          Légende / Crédit
        </Label>
        <Input
          id="heroCaption"
          {...register('hero_image_caption')}
          placeholder="Photo: Tomobile 360"
          className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
        />
      </div>
    </div>
  )
}
