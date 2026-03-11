export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-dark-700 to-dark-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            {/* Title skeleton */}
            <div className="h-10 w-64 bg-white/10 rounded-lg mx-auto mb-6" />
            <div className="h-6 w-96 bg-white/10 rounded-lg mx-auto mb-8" />

            {/* Search form skeleton */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex gap-4 mb-4">
                <div className="h-12 flex-1 bg-white/20 rounded-xl" />
                <div className="h-12 flex-1 bg-white/20 rounded-xl" />
              </div>
              <div className="flex gap-4">
                <div className="h-12 flex-1 bg-white/20 rounded-xl" />
                <div className="h-12 flex-1 bg-white/20 rounded-xl" />
                <div className="h-12 w-32 bg-secondary/50 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Carousel Skeleton */}
      <div className="py-8 bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 w-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections Skeleton */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="h-8 w-64 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Vehicle Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
                {/* Image skeleton */}
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                {/* Content skeleton */}
                <div className="p-4">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-24 bg-secondary/30 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section Skeleton */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mx-auto mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-4 w-20 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        <span className="text-sm font-medium">Chargement...</span>
      </div>
    </div>
  )
}
