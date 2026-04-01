'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-primary">
          Une erreur s&apos;est produite
        </h2>
        <p className="text-gray-500 mb-6">
          Impossible de charger cette page. Vérifiez votre connexion et réessayez.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted px-3 py-2 rounded">
            ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Link href="/occasion">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ChevronLeft className="h-4 w-4" />
              Retour aux annonces
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
