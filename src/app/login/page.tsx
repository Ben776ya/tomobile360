import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { checkAdmin } from '@/lib/auth/check-admin'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  // Already signed in as an admin → go straight to the dashboard.
  const auth = await checkAdmin()
  if (!auth.error) {
    redirect('/admin')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-display font-bold text-slate-700">Connexion</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Accès réservé à l’administration de Tomobile 360.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
