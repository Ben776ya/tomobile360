'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-accent mb-2">404</h1>
          <div className="w-16 h-1 bg-accent mx-auto mb-6" />
        </div>

        <h2 className="text-2xl font-bold mb-3 text-primary">
          Page non trouvée
        </h2>

        <p className="text-muted-foreground mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>

          <Link href="/neuf">
            <Button variant="outline" className="gap-2 w-full sm:w-auto shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <Search className="h-4 w-4" />
              Voir les véhicules
            </Button>
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="text-sm text-muted-foreground hover:text-accent transition inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour à la page précédente
        </button>
      </div>
    </div>
  )
}
