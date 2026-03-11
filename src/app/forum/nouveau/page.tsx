'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewTopicPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    content: '',
  })

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Vous devez être connecté pour créer un sujet')
      router.push('/login')
    }
  }, [supabase, router])

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('forum_categories')
      .select('id, name')
      .order('name')

    if (data) {
      setCategories(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchCategories()
    checkAuth()
  }, [fetchCategories, checkAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_id || !formData.title.trim() || !formData.content.trim()) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Vous devez être connecté')
        return
      }

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: formData.category_id,
          author_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
        })
        .select()
        .single()

      if (error) throw error

      alert('Votre sujet a été créé avec succès!')
      router.push(`/forum/topic/${data.id}`)
    } catch {
      alert('Erreur lors de la création du sujet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au forum
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Créer un nouveau sujet
          </h1>
          <p className="text-gray-600">
            Partagez vos questions, expériences ou discussions avec la communauté
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-card p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nouveau sujet</h2>
                <p className="text-sm text-gray-500">
                  Remplissez les informations ci-dessous
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-gray-700">Catégorie *</Label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-gray-700">Titre du sujet *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Besoin de conseils pour l'entretien de ma voiture"
                  maxLength={200}
                  required
                  className="bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:ring-secondary/50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.title.length}/200 caractères
                </p>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-gray-700">Message *</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={10}
                  placeholder="Décrivez votre question ou votre discussion en détail..."
                  className="w-full mt-1 px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 20 caractères
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-gray-50/50 rounded-md p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Règles du forum</h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Soyez respectueux envers les autres membres</li>
                  <li>• Pas de spam ou de publicité non sollicitée</li>
                  <li>• Utilisez un titre clair et descriptif</li>
                  <li>• Recherchez avant de poster pour éviter les doublons</li>
                  <li>• Restez dans le sujet de la catégorie choisie</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 shadow-glow-cyan hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-secondary text-white hover:bg-secondary-400">
                  {loading ? 'Publication...' : 'Publier le sujet'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="shadow-card hover:shadow-elevated transition-all duration-300 border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary/20"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
