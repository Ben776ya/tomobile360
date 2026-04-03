import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from './JsonLd'

const BASE_URL = 'https://tomobile360.ma'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ name: 'Accueil', href: '/' }, ...items]

  const jsonLdItems = allItems.map((item, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1,
    name: item.name,
    ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
  }))

  return (
    <>
      <JsonLd
        data={{
          '@type': 'BreadcrumbList',
          itemListElement: jsonLdItems,
        }}
      />
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
              {item.href && index < allItems.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:text-secondary transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
