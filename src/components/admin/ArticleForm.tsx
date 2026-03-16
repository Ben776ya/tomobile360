'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createArticle, updateArticle } from '@/lib/actions/admin'
import { Loader2, Plus, X, Upload, Eye, Edit } from 'lucide-react'
import type { Article } from '@/lib/types'

interface ArticleFormProps {
  article?: Article
  mode: 'create' | 'edit'
}

const categories = [
  { value: 'morocco', label: 'Maroc' },
  { value: 'international', label: 'International' },
  { value: 'market', label: 'Marché' },
  { value: 'review', label: 'Essai' },
  { value: 'news', label: 'Actualité' },
  { value: 'technology', label: 'Technologie' },
]

export function ArticleForm({ article, mode }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const [title, setTitle] = useState(article?.title || '')
  const [slug, setSlug] = useState(article?.slug || '')
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [content, setContent] = useState(article?.content || '')
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image || '')
  const [category, setCategory] = useState(article?.category || '')
  const [tags, setTags] = useState<string[]>(article?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false)

  // Auto-generate slug from title
  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }, [])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create') {
      setSlug(generateSlug(value))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        setContent(text)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!title || !slug || !content) {
      setError('Titre, slug et contenu sont obligatoires')
      setLoading(false)
      return
    }

    const articleData = {
      title,
      slug,
      excerpt: excerpt || title,
      content,
      featured_image: featuredImage || undefined,
      category: category || 'news',
      tags: tags.length > 0 ? tags : undefined,
      is_published: isPublished,
    }

    let result
    if (mode === 'create') {
      result = await createArticle(articleData)
    } else {
      result = await updateArticle(article!.id, articleData)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(mode === 'create' ? 'Article créé avec succès!' : 'Article modifié avec succès!')
    setLoading(false)

    setTimeout(() => {
      router.push('/admin/content')
      router.refresh()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-dark-100">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titre de l'article..."
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug" className="text-dark-100">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="titre-de-l-article"
              className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
            <p className="text-xs text-dark-300 mt-1">Généré automatiquement à partir du titre</p>
          </div>
          <div>
            <Label htmlFor="excerpt" className="text-dark-100">Extrait</Label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Résumé court de l'article..."
              className="mt-1 flex w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white placeholder-dark-400 min-h-[80px] resize-y focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-dark-100">Catégorie</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              >
                <option value="">Sélectionner...</option>
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="featuredImage" className="text-dark-100">Image à la une (URL)</Label>
              <Input
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
        <div className="flex gap-2 mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Ajouter un tag..."
            className="flex-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button type="button" variant="outline" onClick={addTag} className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full">
              {tag}
              <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Content - Markdown Editor */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Contenu (Markdown) *</h3>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer">
                <Upload className="h-4 w-4" />
                Importer .md
              </span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
            >
              {previewMode ? <Edit className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {previewMode ? 'Éditer' : 'Aperçu'}
            </Button>
          </div>
        </div>

        {previewMode ? (
          <div className="prose prose-sm prose-invert max-w-none border border-white/10 rounded-md p-4 min-h-[400px] bg-dark-600/30">
            {content ? (
              <div className="whitespace-pre-wrap text-dark-100">{content}</div>
            ) : (
              <p className="text-dark-400 italic">Aucun contenu à afficher</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre article en Markdown...

# Titre principal

## Sous-titre

Paragraphe de texte avec **gras** et *italique*.

- Liste à puces
- Autre élément

1. Liste numérotée
2. Autre élément"
            className="w-full rounded-md border border-white/10 bg-dark-700/80 px-4 py-3 text-sm font-mono text-white placeholder-dark-400 min-h-[400px] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
          />
        )}
      </div>

      {/* Publishing Options */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Publication</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">Publier immédiatement</span>
        </label>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="bg-[#78350f]/30 border border-[#32B75C]/30 text-[#32B75C] text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} className="px-8 shadow-dark-card hover:shadow-dark-elevated hover:-translate-y-0.5 transition-all duration-300">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Création...' : 'Modification...'}
            </span>
          ) : (
            mode === 'create' ? 'Créer l\'article' : 'Enregistrer les modifications'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/content')} className="shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50">
          Annuler
        </Button>
      </div>
    </form>
  )
}
