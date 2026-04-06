'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  FileText,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_LABELS: Record<string, string> = {
  marche: 'Marché',
  nouveautes: 'Nouveautés',
  pratique: 'Pratique',
  tendances: 'Tendances',
  interview: 'Interview',
}

type SortField = 'published_at' | 'views' | 'title'
type SortDir = 'asc' | 'desc'

interface BlogPostRow {
  id: string
  title: string
  slug: string
  category: string
  status: string
  published_at: string | null
  created_at: string
  views: number
  featured: boolean
  hero_image_url: string | null
}

export default function AdminBlogPage() {
  const router = useRouter()
  const supabase = createClient()

  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('published_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, category, status, published_at, created_at, views, featured, hero_image_url')
      .order(sortField === 'published_at' ? 'created_at' : sortField, { ascending: sortDir === 'asc' })

    if (sortField === 'published_at') {
      query = query.order('published_at', { ascending: sortDir === 'asc', nullsFirst: false })
    }

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    const { data } = await query.limit(100)
    setPosts((data as BlogPostRow[]) ?? [])
    setLoading(false)
  }, [supabase, sortField, sortDir, search])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const togglePublish = async (post: BlogPostRow) => {
    setActionLoading(post.id)
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
      }),
    })
    await fetchPosts()
    setActionLoading(null)
  }

  const deletePost = async (post: BlogPostRow) => {
    if (!confirm(`Supprimer "${post.title}" ?`)) return
    setActionLoading(post.id)
    await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
    await fetchPosts()
    setActionLoading(null)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Blog</h1>
            <p className="text-dark-200">
              Gérez les articles du blog Tomobile 360
            </p>
          </div>
          <Link href="/admin/blog/new">
            <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau post
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            <Input
              placeholder="Rechercher par titre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus:ring-secondary/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('published_at')}
              className={`border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50 ${sortField === 'published_at' ? 'ring-1 ring-secondary/50' : ''}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
              Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('views')}
              className={`border-white/10 text-dark-200 hover:text-white hover:bg-dark-600/50 ${sortField === 'views' ? 'ring-1 ring-secondary/50' : ''}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
              Vues
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-dark-300" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun article
            </h3>
            <p className="text-dark-300 mb-4">
              Commencez par créer votre premier article de blog.
            </p>
            <Link href="/admin/blog/new">
              <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                          {post.hero_image_url ? (
                            <Image
                              src={post.hero_image_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-dark-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white line-clamp-1">
                            {post.title}
                          </p>
                          {post.featured && (
                            <span className="text-xs text-secondary">
                              En vedette
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[post.category] || post.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <Badge variant="default">Publié</Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">
                        {new Date(
                          post.published_at || post.created_at,
                        ).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-dark-300" />
                        <span className="text-sm text-dark-100">
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View on site */}
                        {post.status === 'published' && (
                          <a
                            href={`/actu/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {/* Toggle publish */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish(post)}
                          disabled={actionLoading === post.id}
                          className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary"
                          title={
                            post.status === 'published'
                              ? 'Dépublier'
                              : 'Publier'
                          }
                        >
                          {actionLoading === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : post.status === 'published' ? (
                            <ToggleRight className="h-4 w-4 text-green-400" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        {/* Edit */}
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shadow-sm border border-border hover:shadow-md hover:bg-primary/5 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post)}
                          disabled={actionLoading === post.id}
                          className="shadow-sm border border-border hover:shadow-md hover:bg-[#fef3c7] hover:border-[#fde68a]"
                        >
                          <Trash2 className="h-4 w-4 text-[#d4921f]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
