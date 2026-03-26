import Image from 'next/image'
import type { Brand } from '@/lib/types'

interface BrandHeaderProps {
  brand: Brand
}

export function BrandHeader({ brand }: BrandHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex items-center gap-6">
      {brand.logo_url && (
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={brand.logo_url}
            alt={`Logo ${brand.name}`}
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-primary font-display">
          {brand.name}
        </h2>
        {brand.description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {brand.description}
          </p>
        )}
      </div>
    </div>
  )
}
