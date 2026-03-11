'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PostListingForm } from '@/components/vehicles/PostListingForm'

export default function SellVehiclePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/occasion"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux annonces
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Vendre ma Voiture
          </h1>
          <p className="text-gray-600">
            Créez votre annonce en 5 étapes simples
          </p>
        </div>

        {/* Form */}
        <PostListingForm />
      </div>
    </div>
  )
}
