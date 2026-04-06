export default function LoadingActu() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="h-10 w-80 bg-muted animate-pulse rounded mb-3" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </div>

        {/* Intro box */}
        <div className="mb-6 bg-white rounded-xl border border-gray-100 p-6">
          <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>

        {/* Category filter */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-8 border border-gray-100">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        </div>

        {/* Featured skeleton */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-80 bg-muted animate-pulse" />
            <div className="p-8 space-y-4">
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-8 w-full bg-muted animate-pulse rounded" />
              <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="aspect-[16/10] bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
