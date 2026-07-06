import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { paginationRange, ELLIPSIS } from '@/lib/blog/pagination'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Builds the href for a given page number. */
  hrefFor: (page: number) => string
}

export function Pagination({ currentPage, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = paginationRange(currentPage, totalPages)

  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-secondary/10 hover:border-secondary transition-all duration-300 flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === ELLIPSIS ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={hrefFor(p)}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                p === currentPage
                  ? 'bg-secondary text-white font-bold shadow-[0_0_12px_rgba(0,110,254,0.25)] ring-2 ring-secondary/30'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-secondary/10 hover:border-secondary'
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-secondary/10 hover:border-secondary transition-all duration-300 flex items-center gap-1 text-sm"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
