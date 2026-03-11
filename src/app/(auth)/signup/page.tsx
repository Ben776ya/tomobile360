'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '@/app/actions/auth'
import { UserPlus } from 'lucide-react'

const moroccanCities = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kenitra',
  'Tétouan',
  'Safi',
  'Mohammédia',
  'El Jadida',
  'Khouribga',
  'Béni Mellal',
  'Nador',
]

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordMatch, setPasswordMatch] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
      setPasswordMatch(false)
      return
    }

    setLoading(true)
    setError(null)
    setPasswordMatch(true)

    const result = await signup(formData)

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
              <UserPlus className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-dark-200">
              Rejoignez Tomobile 360 aujourd&apos;hui
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!passwordMatch && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Les mots de passe ne correspondent pas
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-dark-100">Nom complet *</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
                autoComplete="name"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark-100">Email *</Label>
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
              <Label htmlFor="password" className="text-dark-100">Mot de passe *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
              <p className="text-xs text-dark-300">
                Minimum 6 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-dark-100">Confirmer le mot de passe *</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-dark-100">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0600000000"
                autoComplete="tel"
                className="bg-dark-600/50 border-white/10 text-white placeholder-dark-400 focus-visible:ring-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-dark-100">Ville (optionnel)</Label>
              <select
                id="city"
                name="city"
                className="flex h-10 w-full rounded-md border border-white/10 bg-dark-600/50 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2"
              >
                <option value="">Sélectionnez une ville</option>
                {moroccanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 rounded border-white/20 bg-dark-600 text-secondary focus:ring-secondary"
              />
              <label htmlFor="terms" className="text-sm text-dark-200">
                J&apos;accepte les{' '}
                <Link href="/conditions" className="text-secondary hover:underline">
                  Conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="text-secondary hover:underline">
                  Politique de confidentialité
                </Link>
              </label>
            </div>

            <Button type="submit" variant="secondary" className="w-full shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-0.5 transition-all duration-300" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-200">
              Vous avez déjà un compte?{' '}
              <Link
                href="/login"
                className="text-secondary font-medium hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
