import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Car, Users, FileText, Video, MessageSquare, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalNewVehicles },
    { count: totalUsedVehicles },
    { count: totalUsers },
    { count: totalArticles },
    { count: totalVideos },
    { count: totalForumTopics },
  ] = await Promise.all([
    supabase.from('vehicles_new').select('id', { count: 'exact', head: true }),
    supabase.from('vehicles_used').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('videos').select('id', { count: 'exact', head: true }),
    supabase.from('forum_topics').select('id', { count: 'exact', head: true }),
  ])

  // Fetch recent activity
  const { data: recentListings } = await supabase
    .from('vehicles_used')
    .select(`
      id,
      created_at,
      brands:brand_id (name),
      models:model_id (name),
      profiles:user_id (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Tableau de bord Admin
          </h1>
          <p className="text-dark-200">
            Gérez votre plateforme Tomobile 360
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Véhicules neufs', count: totalNewVehicles, icon: Car },
            { label: "Annonces d'occasion", count: totalUsedVehicles, icon: Car },
            { label: 'Utilisateurs', count: totalUsers, icon: Users },
            { label: 'Articles', count: totalArticles, icon: FileText },
            { label: 'Vidéos', count: totalVideos, icon: Video },
            { label: 'Sujets forum', count: totalForumTopics, icon: MessageSquare },
          ].map((stat) => (
            <div key={stat.label} className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 hover:border-secondary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-dark-200">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {stat.count || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Link href="/admin/vehicles">
                <Button variant="outline" className="w-full justify-start shadow-sm hover:shadow-glow-indigo-sm">
                  <Car className="h-4 w-4 mr-2" />
                  Gérer les véhicules
                </Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="outline" className="w-full justify-start shadow-sm hover:shadow-glow-indigo-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Gérer le contenu
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start shadow-sm hover:shadow-glow-indigo-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les utilisateurs
                </Button>
              </Link>
              <Link href="/admin/promotions">
                <Button variant="outline" className="w-full justify-start shadow-sm hover:shadow-glow-indigo-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gérer les promotions
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Activité récente
            </h2>
            <div className="space-y-4">
              {recentListings && recentListings.length > 0 ? (
                recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Car className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        Nouvelle annonce:{' '}
                        {(listing.brands as any)?.name} {(listing.models as any)?.name}
                      </p>
                      <p className="text-xs text-dark-300">
                        par {(listing.profiles as any)?.full_name || 'Anonyme'} •{' '}
                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-dark-300 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>
        </div>
    </>
  )
}
