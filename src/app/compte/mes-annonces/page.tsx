import { createClient } from '@/lib/supabase/server'
import { Plus, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UsedListingCard } from '@/components/vehicles/UsedListingCard'
import { ListingActions } from '@/components/listings/ListingActions'

export default async function MyListingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's listings
  const { data: listings } = await supabase
    .from('vehicles_used')
    .select(`
      *,
      brands:brand_id (name, logo_url),
      models:model_id (name),
      profiles:user_id (full_name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Group by status
  const activeListings = listings?.filter((l) => l.is_active && !l.is_sold) || []
  const soldListings = listings?.filter((l) => l.is_sold) || []
  const inactiveListings = listings?.filter((l) => !l.is_active && !l.is_sold) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Mes annonces
          </h1>
          <p className="text-gray-500">
            Gérez toutes vos annonces de véhicules
          </p>
        </div>
        <a href="https://www.m-occaz.ma/vendez-votre-vehicule" target="_blank" rel="noopener noreferrer">
          <Button className="gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <Plus className="h-5 w-5" />
            Nouvelle annonce
          </Button>
        </a>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Actives</p>
          <p className="text-2xl font-bold text-green-400">{activeListings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Vendues</p>
          <p className="text-2xl font-bold text-blue-400">{soldListings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
          <p className="text-sm text-gray-400 mb-1">Inactives</p>
          <p className="text-2xl font-bold text-gray-400">{inactiveListings.length}</p>
        </div>
      </div>

      {/* Active Listings */}
      {activeListings.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">
              Annonces actives
            </h2>
            <Badge variant="success">{activeListings.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeListings.map((listing) => (
              <div key={listing.id} className="relative">
                <UsedListingCard listing={listing} />
                <div className="mt-2">
                  <ListingActions listingId={listing.id} status="active" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sold Listings */}
      {soldListings.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">
              Annonces vendues
            </h2>
            <Badge variant="secondary">{soldListings.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soldListings.map((listing) => (
              <div key={listing.id} className="relative opacity-75">
                <UsedListingCard listing={listing} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    VENDU
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Listings */}
      {inactiveListings.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">
              Annonces inactives
            </h2>
            <Badge variant="outline">{inactiveListings.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveListings.map((listing) => (
              <div key={listing.id} className="relative opacity-75">
                <UsedListingCard listing={listing} />
                <div className="mt-2">
                  <ListingActions listingId={listing.id} status="inactive" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {listings?.length === 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-12 text-center">
          <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Vous n&apos;avez pas encore d&apos;annonces
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez à vendre votre véhicule dès maintenant
          </p>
          <a href="https://www.m-occaz.ma/vendez-votre-vehicule" target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <Plus className="h-5 w-5" />
              Créer ma première annonce
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
