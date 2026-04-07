'use client'

import Link from 'next/link'

export default function ActuError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Oups, une erreur est survenue
        </h2>
        <p className="text-gray-500 mb-6">
          Impossible de charger les articles pour le moment. Veuillez
          réessayer.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition font-medium"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
