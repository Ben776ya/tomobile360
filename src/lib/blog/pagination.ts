/**
 * Sentinel value in a page range that means "…" (a collapsed gap), not a page.
 */
export const ELLIPSIS = -1

/**
 * Build the sequence of page numbers to show in a pager. Returns actual page
 * numbers plus `ELLIPSIS` markers for collapsed gaps. Up to 7 pages are shown
 * in full; beyond that, the first/last pages are always shown with the current
 * page's neighbours, and gaps are collapsed to `ELLIPSIS`.
 */
export function paginationRange(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: number[] = [1]
  if (currentPage > 3) pages.push(ELLIPSIS)
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i)
  }
  if (currentPage < totalPages - 2) pages.push(ELLIPSIS)
  pages.push(totalPages)
  return pages
}
