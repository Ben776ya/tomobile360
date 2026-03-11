'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/app/actions/auth'
import { KeyRound, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-800 bg-grid px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-elevated border border-white/10 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 border border-success/30 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email envoyé!
            </h1>
            <p className="text-dark-200 mb-6">
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-dark-300 mb-6">
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-0.5 transition-all duration-300">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800 bg-grid px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg shadow-dark-elevated border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 border border-primary/30 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-dark-200">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

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

            <Button type="submit" variant="secondary" className="w-full shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-0.5 transition-all duration-300" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
          </form>

          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 text-sm text-secondary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
