export default function LoadingActu() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Dark Header Skeleton */}
        <div className="bg-gradient-to-br from-primary to-[#0a1628] rounded-2xl px-6 sm:px-8 py-10 sm:py-12 mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-14 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-3 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Title */}
          <div className="h-9 w-72 bg-white/10 animate-pulse rounded mb-3" />
          <div className="h-5 w-56 bg-white/10 animate-pulse rounded mb-8" />

          {/* Category pills */}
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-white/[0.08] animate-pulse rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Featured skeleton */}
        <div className="rounded-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gradient-to-r from-primary to-[#2a3a5c]">
            <div className="p-8 sm:p-10 space-y-4">
              <div className="h-7 w-24 bg-white/10 animate-pulse rounded-full" />
              <div className="h-4 w-16 bg-white/10 animate-pulse rounded" />
              <div className="h-7 w-full bg-white/10 animate-pulse rounded" />
              <div className="h-7 w-2/3 bg-white/10 animate-pulse rounded" />
              <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded" />
            </div>
            <div className="h-56 sm:h-64 md:h-auto md:min-h-[320px] bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
