'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  FileText,
  Users,
  TrendingUp,
  Upload,
  Video,
  LogOut,
  Shield,
  ExternalLink
} from 'lucide-react'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { href: '/admin/vehicles', icon: Car, label: 'Véhicules' },
  { href: '/admin/content', icon: FileText, label: 'Contenu' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/promotions', icon: TrendingUp, label: 'Promotions' },
  { href: '/admin/import-cars', icon: Upload, label: 'Importer véhicules' },
  { href: '/admin/sync-videos', icon: Video, label: 'Sync vidéos' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-card border border-white/10 p-6 sticky top-4">
      {/* Admin Info */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mb-3 mx-auto">
          <Shield className="h-8 w-8 text-primary-300" />
        </div>
        <h3 className="font-semibold text-center text-secondary">
          Administration
        </h3>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary text-white shadow-glow-indigo-sm'
                  : 'text-dark-200 hover:bg-white/5 hover:text-secondary hover:shadow-sm hover:translate-x-1'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Back to site + Logout */}
      <div className="mt-6 pt-6 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-200 hover:bg-secondary/10 hover:text-secondary hover:shadow-sm transition-all duration-200"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Retour au site</span>
        </Link>
        <form action="/actions/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-200 hover:bg-[#32B75C]/10 hover:text-[#32B75C] hover:shadow-sm transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </form>
      </div>
    </div>
  )
}
