import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Car,
  Heart,
  User,
  LogOut
} from 'lucide-react'

const menuItems = [
  {
    href: '/compte',
    icon: LayoutDashboard,
    label: 'Tableau de bord',
  },
  {
    href: '/compte/mes-annonces',
    icon: Car,
    label: 'Mes annonces',
  },
  {
    href: '/compte/favoris',
    icon: Heart,
    label: 'Mes favoris',
  },
  {
    href: '/compte/profil',
    icon: User,
    label: 'Mon profil',
  },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 sticky top-4">
              {/* User Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <User className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold text-center text-primary">
                  {profile?.full_name || 'Utilisateur'}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {user.email}
                </p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100 transition text-gray-700 hover:text-secondary"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Logout */}
              <form action="/actions/logout" method="post" className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#78350f]/30 transition text-gray-700 hover:text-[#FFC358] w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
