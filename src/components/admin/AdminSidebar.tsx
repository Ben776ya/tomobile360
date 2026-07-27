'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  PenSquare,
  Users,
  TrendingUp,
  Upload,
  Video,
  LogOut,
  Shield,
  ExternalLink,
  Heart,
  FileText,
  Mail
} from 'lucide-react'
import type { StaffRole } from '@/lib/auth/check-admin'

// `roles` mirrors the server-side gates: middleware confines journalists to
// /admin/blog and every other server action requires checkAdmin(). Hiding a
// link is presentation only — it is never the thing enforcing access.
const menuItems: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  exact?: boolean
  roles: StaffRole[]
}[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', exact: true, roles: ['admin'] },
  { href: '/admin/brands', icon: Car, label: 'Catalogue', roles: ['admin'] },
  { href: '/admin/coups-de-coeur', icon: Heart, label: 'Coups de Cœur', roles: ['admin'] },
  { href: '/admin/fiches-techniques', icon: FileText, label: 'Fiches Techniques', roles: ['admin'] },
  { href: '/admin/blog', icon: PenSquare, label: 'Blog', roles: ['admin', 'journalist'] },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs', roles: ['admin'] },
  { href: '/admin/messages', icon: Mail, label: 'Messages', roles: ['admin'] },
  { href: '/admin/promotions', icon: TrendingUp, label: 'Promotions', roles: ['admin'] },
  { href: '/admin/import-cars', icon: Upload, label: 'Importer véhicules', roles: ['admin'] },
  { href: '/admin/sync-videos', icon: Video, label: 'Sync vidéos', roles: ['admin'] },
  { href: '/admin/narsa-videos', icon: Shield, label: 'Vidéos NARSA', roles: ['admin'] },
]

export function AdminSidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname()
  const visibleItems = menuItems.filter((item) => item.roles.includes(role))

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-dark-700 rounded-lg shadow-dark-card border border-white/10 p-6 sticky top-4">
      {/* Admin Info */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mb-3 mx-auto">
          <Shield className="h-8 w-8 text-primary-300" />
        </div>
        <h3 className="font-semibold text-center text-secondary">
          {role === 'journalist' ? 'Rédaction' : 'Administration'}
        </h3>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary text-white'
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
        {/* The handler is a GET route at /logout — a POST to /actions/logout
            (the previous target) 404s. */}
        <Link
          href="/logout"
          prefetch={false}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-200 hover:bg-[#32B75C]/10 hover:text-[#32B75C] hover:shadow-sm transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </Link>
      </div>
    </div>
  )
}
