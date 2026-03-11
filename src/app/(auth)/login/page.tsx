'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/app/actions/auth'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800 bg-grid px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-elevated border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 border border-primary/30 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-dark-200">
              Accédez à votre compte Tomobile 360
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-md">
              <p className="text-sm text-secondary">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark-100">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
                autoComplete="email"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-dark-100">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-dark-600 text-secondary focus:ring-secondary"
                />
                <span className="text-sm text-dark-200">
                  Se souvenir de moi
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-secondary hover:underline"
              >
                Mot de passe oublié?
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-0.5 transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-200">
              Vous n&apos;avez pas de compte?{' '}
              <Link
                href="/signup"
                className="text-secondary font-medium hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-dark-300 mt-4">
          En vous connectant, vous acceptez nos{' '}
          <Link href="/conditions" className="text-secondary hover:underline">
            Conditions d&apos;utilisation
          </Link>
        </p>
      </div>
    </div>
  )
}
