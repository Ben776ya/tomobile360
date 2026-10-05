'use client'

import { useController, useFormContext } from 'react-hook-form'
import { ArticleEditor } from '@/components/admin/editor/ArticleEditor'
import type { BlogPostFormValues } from './types'
import { MdImporter } from './MdImporter'

interface ContentSectionProps {
  mode: 'create' | 'edit'
}

export function ContentSection({ mode }: ContentSectionProps) {
  const { control } = useFormContext<BlogPostFormValues>()

  // Bound through useController so the editor reflects form state — the .md
  // importer rewrites `content` imperatively and the editor reloads from it.
  const {
    field: { value: content, onChange: setContent },
  } = useController({ control, name: 'content' })

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Contenu *</h3>
          <p className="text-xs text-dark-400 mt-0.5">
            Texte, images, galeries photos et vidéos (YouTube, Instagram, Facebook…).
          </p>
        </div>
        <MdImporter mode={mode} />
      </div>

      <ArticleEditor value={content ?? ''} onChange={setContent} />
    </div>
  )
}
