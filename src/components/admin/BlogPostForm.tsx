'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { BlogImageManager, buildMarkdown } from '@/components/admin/BlogImageManager'
import type { ManagedImage } from '@/components/admin/BlogImageManager'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { parseMarkdownFile } from '@/lib/parseMarkdownFile'
import {
  Loader2,
  Plus,
  X,
  Eye,
  Edit,
  Save,
  Send,
  FileUp,
  MousePointerClick,
} from 'lucide-react'
import type { BlogPost } from '@/lib/types/blog'

interface BlogPostFormProps {
  post?: BlogPost & {
    images?: Array<{
      id: string
      image_url: string
      alt_text: string | null
      caption: string | null
      display_order: number
      size: string
      float_position: string
    }>
  }
  mode: 'create' | 'edit'
}

const CATEGORIES = [
  { value: 'marche', label: 'Marché' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'pratique', label: 'Pratique' },
  { value: 'tendances', label: 'Tendances' },
  { value: 'interview', label: 'Interview' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function BlogPostForm({ post, mode }: BlogPostFormProps) {
  const router = useRouter()
  const mdFileRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [subtitle, setSubtitle] = useState(post?.subtitle || '')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '')
  const [category, setCategory] = useState(post?.category || '')
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [author, setAuthor] = useState(post?.author || 'Rédaction Tomobile360')
  const [heroImageUrl, setHeroImageUrl] = useState(post?.hero_image_url || '')
  const [heroImageCaption, setHeroImageCaption] = useState(post?.hero_image_caption || '')
  const [content, setContent] = useState(post?.content || '')
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [inlineImages, setInlineImages] = useState<ManagedImage[]>(() => {
    if (!post?.images) return []
    return post.images.map((img) => ({
      id: img.id,
      url: img.image_url,
      alt: img.alt_text || '',
      caption: img.caption || '',
      size: (img.size as ManagedImage['size']) || 'full',
      float: (img.float_position as ManagedImage['float']) || 'none',
    }))
  })
  const [activeInsertId, setActiveInsertId] = useState<string | null>(null)

  // Escape key cancels placement mode
  useEffect(() => {
    if (!activeInsertId) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveInsertId(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeInsertId])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create') {
      setSlug(slugify(value))
    }
  }

  const addTag = useCallback(() => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }, [newTag, tags])

  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const parsed = parseMarkdownFile(text)
      setContent(parsed.content)

      // Auto-fill metadata from frontmatter
      const m = parsed.metadata
      if (m.title) {
        setTitle(m.title)
        if (mode === 'create') setSlug(m.slug || slugify(m.title))
      }
      if (m.slug && mode === 'create') setSlug(m.slug)
      if (m.subtitle) setSubtitle(m.subtitle)
      if (m.meta_description) setMetaDescription(m.meta_description)
      if (m.category) setCategory(m.category)
      if (m.tags && m.tags.length > 0) setTags(m.tags)
      if (m.author) setAuthor(m.author)
    }
    reader.readAsText(file)
  }

  const handleInsertImage = useCallback(
    (markdown: string) => {
      const ta = contentRef.current
      if (ta) {
        const start = ta.selectionStart ?? content.length
        const before = content.slice(0, start)
        const after = content.slice(start)
        setContent(before + markdown + after)
        requestAnimationFrame(() => {
          ta.focus()
          const pos = start + markdown.length
          ta.setSelectionRange(pos, pos)
        })
      } else {
        setContent(content + markdown)
      }
    },
    [content],
  )

  const handleRemoveImage = useCallback(
    (image: ManagedImage) => {
      const escapedUrl = image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`\\n?!\\[[^\\]]*\\]\\(${escapedUrl}[^)]*\\)\\n?`, 'g')
      setContent((prev) => prev.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n'))
    },
    [],
  )

  // Click-to-place: when an image is in placement mode and user clicks textarea
  const handleTextareaClick = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!activeInsertId) return
      const image = inlineImages.find((img) => img.id === activeInsertId)
      if (!image) return

      const ta = e.currentTarget
      // Use a small delay so the browser sets the cursor position from the click
      requestAnimationFrame(() => {
        const pos = ta.selectionStart ?? content.length
        const markdown = `\n${buildMarkdown(image)}\n`
        const before = content.slice(0, pos)
        const after = content.slice(pos)
        setContent(before + markdown + after)
        setActiveInsertId(null)

        requestAnimationFrame(() => {
          ta.focus()
          const newPos = pos + markdown.length
          ta.setSelectionRange(newPos, newPos)
        })
      })
    },
    [activeInsertId, inlineImages, content],
  )

  const submit = async (status: 'draft' | 'published') => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!title || !content || !category) {
      setError('Titre, contenu et catégorie sont obligatoires.')
      setLoading(false)
      return
    }

    const body = {
      title,
      slug: slug || slugify(title),
      subtitle: subtitle || null,
      meta_description: metaDescription || null,
      category,
      tags,
      content,
      hero_image_url: heroImageUrl || null,
      hero_image_caption: heroImageCaption || null,
      author,
      status,
      featured,
      inline_images: inlineImages.map((img, i) => ({
        image_url: img.url,
        alt_text: img.alt || null,
        caption: img.caption || null,
        display_order: i,
        size: img.size,
        float_position: img.float,
      })),
    }

    try {
      const url =
        mode === 'create'
          ? '/api/admin/blog'
          : `/api/admin/blog/${post!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur serveur')
        setLoading(false)
        return
      }

      setSuccess(
        status === 'published'
          ? 'Article publié avec succès !'
          : 'Brouillon enregistré !',
      )
      setLoading(false)
      setTimeout(() => {
        router.push('/admin/blog')
        router.refresh()
      }, 800)
    } catch {
      setError('Erreur réseau')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
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
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
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
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
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
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
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
              value={metaDescription}
              onChange={(e) =>
                setMetaDescription(e.target.value.slice(0, 160))
              }
              placeholder="Description pour les moteurs de recherche (max 160 caractères)..."
              className="mt-1 flex w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white placeholder-dark-400 min-h-[60px] resize-y focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              rows={2}
            />
            <p
              className={`text-xs mt-1 ${
                metaDescription.length > 150
                  ? 'text-orange-400'
                  : 'text-dark-400'
              }`}
            >
              {metaDescription.length}/160 caractères
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-dark-100">Catégorie *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-dark-700/80 px-3 py-2 text-sm text-white focus:ring-secondary/50 focus:ring-2 focus:outline-none"
              >
                <option value="">Sélectionner...</option>
                {CATEGORIES.map((c) => (
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
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Image à la une
        </h3>
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
            value={heroImageCaption}
            onChange={(e) => setHeroImageCaption(e.target.value)}
            placeholder="Photo: Tomobile 360"
            className="mt-1 bg-dark-700/80 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
          />
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((_, j) => j !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Contenu (Markdown) *</h3>
          <div className="flex items-center gap-2">
            {/* .md file import */}
            <label className="cursor-pointer">
              <input
                ref={mdFileRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleMdUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer">
                <FileUp className="h-4 w-4" />
                Importer .md
              </span>
            </label>
            {/* Preview toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
            >
              {previewMode ? (
                <Edit className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              {previewMode ? 'Éditer' : 'Aperçu'}
            </Button>
          </div>
        </div>

        {previewMode ? (
          <div className="border border-white/10 rounded-lg p-6 min-h-[400px] bg-white">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-gray-400 italic">Aucun contenu à afficher</p>
            )}
          </div>
        ) : (
          <div>
            {activeInsertId && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary/10 border border-secondary/30 px-4 py-2.5 text-sm text-secondary animate-pulse">
                <MousePointerClick className="h-4 w-4 flex-shrink-0" />
                <span>Cliquez dans l&apos;editeur pour placer l&apos;image</span>
                <button
                  type="button"
                  onClick={() => setActiveInsertId(null)}
                  className="ml-auto text-xs text-secondary/60 hover:text-secondary underline"
                >
                  Annuler
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-xs text-dark-400 mb-2">Editeur Markdown</p>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onClick={handleTextareaClick}
                  placeholder="Ecrivez votre article en Markdown..."
                  className={cn(
                    'flex-1 w-full rounded-md border bg-dark-700/80 px-4 py-3 text-sm font-mono text-white placeholder-dark-400 min-h-[400px] resize-y focus-visible:outline-none focus-visible:ring-2',
                    activeInsertId
                      ? 'cursor-crosshair border-secondary/50 focus-visible:ring-secondary/70 bg-dark-700/90'
                      : 'border-white/10 focus-visible:ring-secondary/50',
                  )}
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-dark-400 mb-2">Apercu en direct</p>
                <div className="flex-1 rounded-lg border border-white/10 bg-white p-4 min-h-[400px] max-h-[700px] overflow-y-auto">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-gray-400 italic text-sm">L&apos;apercu apparaitra ici...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!previewMode && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <BlogImageManager
              images={inlineImages}
              onChange={setInlineImages}
              onInsert={handleInsertImage}
              onRemove={handleRemoveImage}
              activeInsertId={activeInsertId}
              onActivateInsert={setActiveInsertId}
            />
          </div>
        )}
      </div>

      {/* Publishing Options */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Publication</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-white/10 h-4 w-4"
          />
          <span className="text-sm text-dark-100">
            Mettre en vedette (affiché en héro sur la page Actu)
          </span>
        </label>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => submit('published')}
          disabled={loading}
          className="px-6 shadow-dark-card hover:shadow-dark-elevated hover:-translate-y-0.5 transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Publier
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => submit('draft')}
          disabled={loading}
          className="px-6 shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer brouillon
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/blog')}
          className="shadow-dark-card hover:shadow-dark-elevated transition-all duration-300 border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50"
        >
          Annuler
        </Button>
      </div>
    </div>
  )
}
