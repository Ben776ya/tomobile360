import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromotionActions } from '@/components/admin/PromotionActions'

export const revalidate = 30

export default async function AdminPromotionsPage() {
  const supabase = await createClient()

  // Fetch promotions
  const { data: promotions } = await supabase
    .from('promotions')
    .select(`
      *,
      vehicles_new:vehicle_id (
        id,
        brands:brand_id (name),
        models:model_id (name),
        images
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestion des promotions
            </h1>
            <p className="text-dark-200">
              Gérez les offres promotionnelles
            </p>
          </div>
            <Link href="/admin/promotions/new">
              <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle promotion
              </Button>
            </Link>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Remise
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {promotions && promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 bg-dark-600/50 rounded overflow-hidden flex-shrink-0">
                          {promo.vehicles_new?.images?.[0] ? (
                            <Image
                              src={promo.vehicles_new.images[0]}
                              alt="Promotion"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TrendingUp className="h-6 w-6 text-dark-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1">
                            {promo.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {promo.vehicles_new && (
                        <span className="text-sm text-dark-200">
                          {promo.vehicles_new.brands?.name}{' '}
                          {promo.vehicles_new.models?.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="warning">-{promo.discount_percentage}%</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-300">
                        <p>
                          Du{' '}
                          {new Date(promo.valid_from).toLocaleDateString('fr-FR')}
                        </p>
                        <p>
                          Au{' '}
                          {new Date(promo.valid_until).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {promo.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <PromotionActions
                        promotionId={promo.id}
                        isActive={promo.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!promotions || promotions.length === 0 && (
            <div className="p-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune promotion trouvée
              </h3>
              <p className="text-dark-300 mb-4">
                Créez votre première promotion
              </p>
              <Link href="/admin/promotions/new">
                <Button className="shadow-dark-card hover:shadow-dark-elevated transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle promotion
                </Button>
              </Link>
            </div>
          )}
        </div>
    </>
  )
}
