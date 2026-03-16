import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Car, Eye, Heart, TrendingUp } from 'lucide-react'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user stats
  const [
    { count: totalListings },
    { count: activeListings },
    { count: totalFavorites },
    { data: recentListings },
  ] = await Promise.all([
    supabase
      .from('vehicles_used')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('vehicles_used')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_sold', false),
    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('vehicles_used')
      .select(`
        *,
        brands:brand_id (name, logo_url),
        models:model_id (name),
        profiles:user_id (full_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  // Calculate total views across all listings
  const { data: viewsData } = await supabase
    .from('vehicles_used')
    .select('views')
    .eq('user_id', user.id)

  const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0

  const stats = [
    {
      label: 'Mes annonces',
      value: totalListings || 0,
      icon: Car,
      color: 'text-primary-300',
      bgColor: 'bg-primary/20 border border-primary/30',
    },
    {
      label: 'Annonces actives',
      value: activeListings || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border border-green-500/30',
    },
    {
      label: 'Total des vues',
      value: totalViews,
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border border-purple-500/30',
    },
    {
      label: 'Favoris',
      value: totalFavorites || 0,
      icon: Heart,
      color: 'text-[#32B75C]',
      bgColor: 'bg-[#32B75C]/20 border border-[#32B75C]/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-500">
          Bienvenue sur votre espace personnel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-card border border-gray-200 p-6 hover:border-secondary/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Listings */}
      {recentListings && recentListings.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">
              Mes annonces récentes
            </h2>
            <Link
              href="/compte/mes-annonces"
              className="text-secondary hover:text-secondary-400 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map((listing) => (
              <UsedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/occasion/vendre"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-secondary/40 hover:bg-secondary/5 hover:shadow-gold hover:-translate-y-0.5 transition-all duration-300 text-center"
          >
            <Car className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="font-medium text-primary">Vendre ma voiture</p>
          </Link>

          <Link
            href="/occasion"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-secondary/40 hover:bg-secondary/5 hover:shadow-gold hover:-translate-y-0.5 transition-all duration-300 text-center"
          >
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="font-medium text-primary">Parcourir les annonces</p>
          </Link>

          <Link
            href="/compte/favoris"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-secondary/40 hover:bg-secondary/5 hover:shadow-gold hover:-translate-y-0.5 transition-all duration-300 text-center"
          >
            <Heart className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="font-medium text-primary">Voir mes favoris</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
