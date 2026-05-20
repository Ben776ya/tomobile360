import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { checkAdmin } from '@/lib/auth/check-admin'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin gate. Middleware already redirects non-admins for /admin/*,
  // this is the second authoritative check (no client roundtrip, no spinner flash).
  const auth = await checkAdmin()
  if (auth.error) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-dark-800 bg-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AdminSidebar />
          </aside>
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
