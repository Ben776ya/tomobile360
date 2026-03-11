'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <h2 className="text-2xl font-bold mb-3 text-primary">
          Une erreur s&apos;est produite
        </h2>

        <p className="text-muted-foreground mb-6">
          {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted px-3 py-2 rounded">
            ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Si le problème persiste, veuillez contacter le support.
        </p>
      </div>
    </div>
  )
}
