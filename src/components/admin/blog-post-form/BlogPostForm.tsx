'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Send } from 'lucide-react'
import type { BlogPost } from '@/lib/types/blog'

import type { BlogPostFormValues } from './types'
import { buildBlogPostPayload, buildDefaultValues } from './form-helpers'
import { MetadataSection } from './MetadataSection'
import { HeroImageSection } from './HeroImageSection'
import { TagsSection } from './TagsSection'
import { ContentSection } from './ContentSection'
import { PublishingSection } from './PublishingSection'

export interface BlogPostFormProps {
  post?: BlogPost & {
    images?: Array<{
      id: string
      image_url: string
      alt_text: string | null
      caption: string | null
      display_order: number | null
      size: string | null
      float_position: string | null
    }>
  }
  mode: 'create' | 'edit'
}

export function BlogPostForm({ post, mode }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const form = useForm<BlogPostFormValues>({
    defaultValues: buildDefaultValues(post),
  })
  const { handleSubmit, reset } = form

  // If a parent swaps the `post` prop (e.g., admin edit page re-fetches after
  // a save), refresh the form's values rather than showing stale state
  // captured at first render. Keyed on post.id like B1a's VehicleForm.
  useEffect(() => {
    reset(buildDefaultValues(post))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id])

  // Both Publish and Save-Draft submit the same form values with a different
  // status. We surface them as two buttons (matching the original UX) and
  // route through handleSubmit so RHF's validation pipeline still runs.
  const submitWithStatus = (status: 'draft' | 'published') =>
    handleSubmit(async (values: BlogPostFormValues) => {
      setError('')
      setSuccess('')

      if (!values.title || !values.content || !values.category) {
        setError('Titre, contenu et catégorie sont obligatoires.')
        return
      }

      setLoading(true)

      // `values` is RHF's freshest snapshot from handleSubmit — no closure-
      // capture risk here.
      const body = buildBlogPostPayload(values, status)

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
    })

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <MetadataSection mode={mode} />
        <HeroImageSection />
        <TagsSection />
        <ContentSection mode={mode} />
        <PublishingSection />

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

        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={submitWithStatus('published')}
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
            onClick={submitWithStatus('draft')}
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
      </form>
    </FormProvider>
  )
}
