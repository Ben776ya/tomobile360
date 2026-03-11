export default function LoadingNeuf() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-primary/20 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-muted rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar Skeleton */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              {/* Filter sections */}
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 w-24 bg-muted rounded animate-pulse mb-3" />
                  <div className="space-y-2">
                    <div className="h-10 bg-muted rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
              {/* Apply button */}
              <div className="h-12 bg-primary/30 rounded-xl animate-pulse" />
            </div>
          </aside>

          {/* Results Skeleton */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Vehicle Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
                  {/* Image skeleton */}
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  {/* Content skeleton */}
                  <div className="p-4">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-28 bg-secondary/30 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
