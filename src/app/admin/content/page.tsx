import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { FileText, Video, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { ContentActions } from '@/components/admin/ContentActions'

export const revalidate = 30

interface SearchParams {
  tab?: string
  page?: string
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const tab = searchParams.tab || 'articles'
  const page = parseInt(searchParams.page || '1')
  const itemsPerPage = 20

  // Fetch content based on tab
  let content: any[] = []
  let count = 0

  if (tab === 'articles') {
    const { data, count: total } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    content = data || []
    count = total || 0
  } else {
    const { data, count: total } = await supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    content = data || []
    count = total || 0
  }

  const totalPages = Math.ceil(count / itemsPerPage)

  const categoryLabels: { [key: string]: string } = {
    morocco: 'Maroc',
    Morocco: 'Maroc',
    international: 'International',
    International: 'International',
    market: 'Marché',
    Market: 'Marché',
    review: 'Essai',
    Review: 'Essai',
    technology: 'Technologie',
    news: 'Actualité',
    News: 'Actualité',
    comparison: 'Comparatif',
    guide: 'Guide',
    event: 'Événement',
  }

  return (
    <>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion du contenu
              </h1>
              <p className="text-dark-200">
                Gérez les articles et les vidéos
              </p>
            </div>
            {tab === 'articles' && (
              <Link href="/admin/content/new">
                <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel article
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 mb-6 p-1.5">
          <div className="flex gap-1">
            <Link
              href="/admin/content?tab=articles"
              className={`flex-1 px-6 py-3 text-center font-medium rounded-md transition-all duration-200 ${
                tab === 'articles'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-dark-300 hover:bg-dark-600/50 hover:text-secondary hover:shadow-sm'
              }`}
            >
              Articles
            </Link>
            <Link
              href="/admin/content?tab=videos"
              className={`flex-1 px-6 py-3 text-center font-medium rounded-md transition-all duration-200 ${
                tab === 'videos'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-dark-300 hover:bg-dark-600/50 hover:text-secondary hover:shadow-sm'
              }`}
            >
              Vidéos
            </Link>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    {tab === 'articles' ? 'Article' : 'Vidéo'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {content.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                          {(tab === 'articles' ? item.featured_image : item.thumbnail_url) ? (
                            <Image
                              src={tab === 'articles' ? item.featured_image : item.thumbnail_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {tab === 'articles' ? (
                                <FileText className="h-6 w-6 text-dark-300" />
                              ) : (
                                <Video className="h-6 w-6 text-dark-300" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white line-clamp-1">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.category && (
                        <Badge variant="secondary">
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-dark-300" />
                        <span className="text-sm text-dark-100">
                          {(item.views || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_published ? (
                        <Badge variant="default">Publié</Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">
                        {new Date(
                          tab === 'articles' ? item.published_at : item.created_at
                        ).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ContentActions
                        itemId={item.id}
                        type={tab === 'articles' ? 'article' : 'video'}
                        slug={tab === 'articles' ? item.slug : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {content.length === 0 && (
            <div className="p-12 text-center">
              {tab === 'articles' ? (
                <FileText className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              ) : (
                <Video className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              )}
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun {tab === 'articles' ? 'article' : 'vidéo'} trouvé
              </h3>
              <p className="text-dark-300 mb-4">
                Commencez par créer votre premier{' '}
                {tab === 'articles' ? 'article' : 'vidéo'}
              </p>
              {tab === 'articles' && (
                <Link href="/admin/content/new">
                  <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel article
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/content?tab=${tab}&page=${page - 1}`}>
                <Button variant="outline" className="shadow-dark-card hover:shadow-dark-elevated transition-all border-white/10 text-dark-200 hover:text-white">Précédent</Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1 + Math.max(0, page - 3)
                return p <= totalPages ? (
                  <Link key={p} href={`/admin/content?tab=${tab}&page=${p}`}>
                    <Button variant={p === page ? 'default' : 'outline'} size="sm" className={`shadow-dark-card hover:shadow-dark-elevated transition-all ${p !== page ? 'border-white/10 text-dark-200 hover:text-white' : ''}`}>
                      {p}
                    </Button>
                  </Link>
                ) : null
              })}
            </div>
            {page < totalPages && (
              <Link href={`/admin/content?tab=${tab}&page=${page + 1}`}>
                <Button variant="outline" className="shadow-dark-card hover:shadow-dark-elevated transition-all border-white/10 text-dark-200 hover:text-white">Suivant</Button>
              </Link>
            )}
          </div>
        )}
    </>
  )
}
