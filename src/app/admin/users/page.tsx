import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UserActions } from '@/components/admin/UserActions'

export const revalidate = 30

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get current admin user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-dark-200">
          Gérez les comptes utilisateurs et les permissions
        </p>
      </div>

        {/* Users Table */}
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-600/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-200">
                    Date d&apos;inscription
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-dark-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users && users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-600/50 flex-shrink-0">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.full_name || 'User'}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                              <span className="text-secondary font-semibold">
                                {u.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {u.full_name || 'Anonyme'}
                          </p>
                          {u.phone && (
                            <p className="text-sm text-dark-300">{u.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">
                        {u.email || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-200">
                        {u.city || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <Badge variant="warning">Admin</Badge>
                      ) : (
                        <Badge variant="default">Utilisateur</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark-300">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <UserActions
                        userId={u.id}
                        isAdmin={u.is_admin}
                        fullName={u.full_name}
                        phone={u.phone}
                        city={u.city}
                        isSelf={currentUser?.id === u.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!users || users.length === 0) && (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-dark-300" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun utilisateur trouvé
              </h3>
            </div>
          )}
        </div>
    </>
  )
}
