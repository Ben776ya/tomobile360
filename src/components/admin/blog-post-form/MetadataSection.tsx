'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BlogPostFormValues } from './types'
import { slugify } from './form-helpers'
import { BLOG_CATEGORIES } from '@/lib/blog/categories'
import { BLOG_AUTHORS, isKnownAuthor } from '@/lib/blog/authors'

interface MetadataSectionProps {
  mode: 'create' | 'edit'
}

export function MetadataSection({ mode }: MetadataSectionProps) {
  const { register, setValue, watch } = useFormContext<BlogPostFormValues>()

  // Watch only meta_description so the character-counter rerenders. Other
  // fields use uncontrolled `register()` for performance.
  const metaDescription = watch('meta_description')

  // Watch the author so an existing (uncurated) value is preserved as an
  // option — editing an old post must never silently change its author.
  const currentAuthor = watch('author')

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Informations de base
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-dark-100">
            Titre *
          </Label>
          <Input
            id="title"
            {...register('title', {
              onChange: (e) => {
                if (mode === 'create') {
                  setValue('slug', slugify(e.target.value))
                }
              },
            })}
            placeholder="Titre de l'article..."
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="slug" className="text-dark-100">
            Slug (URL)
          </Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="titre-de-l-article"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
          <p className="text-xs text-dark-300 mt-1">
            Généré automatiquement à partir du titre
          </p>
        </div>
        <div>
          <Label htmlFor="subtitle" className="text-dark-100">
            Sous-titre / Chapô
          </Label>
          <Input
            id="subtitle"
            {...register('subtitle')}
            placeholder="Résumé court de l'article..."
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="metaDescription" className="text-dark-100">
            Meta description SEO
          </Label>
          <textarea
            id="metaDescription"
            {...register('meta_description', {
              setValueAs: (v: string) => (typeof v === 'string' ? v.slice(0, 160) : ''),
            })}
            placeholder="Description pour les moteurs de recherche (max 160 caractères)..."
            className="mt-1 flex w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white placeholder-dark-400 min-h-[60px] resize-y focus:ring-secondary/50 focus:ring-2 focus:outline-none"
            rows={2}
            maxLength={160}
          />
          <p
            className={`text-xs mt-1 ${
              (metaDescription?.length ?? 0) > 150
                ? 'text-orange-400'
                : 'text-dark-400'
            }`}
          >
            {metaDescription?.length ?? 0}/160 caractères
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-dark-100">
              Catégorie *
            </Label>
            <select
              id="category"
              {...register('category')}
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {BLOG_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="author" className="text-dark-100">
              Auteur
            </Label>
            <select
              id="author"
              {...register('author')}
              className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
            >
              {currentAuthor && !isKnownAuthor(currentAuthor) && (
                <option value={currentAuthor}>{currentAuthor}</option>
              )}
              {BLOG_AUTHORS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
