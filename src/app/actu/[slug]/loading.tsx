export default function LoadingArticle() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative w-full min-h-[320px] sm:min-h-[400px] bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/20" />
        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-end h-full pb-10 pt-20 sm:pt-28 min-h-[320px] sm:min-h-[400px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-14 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-3 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-3 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-40 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse" />
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Title */}
          <div className="h-10 w-full max-w-2xl bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-10 w-2/3 max-w-xl bg-white/10 rounded animate-pulse mb-3" />

          {/* Subtitle */}
          <div className="h-5 w-full max-w-xl bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Body + Sidebar Skeleton */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
          {/* Article body */}
          <div className="max-w-[720px]">
            {/* Author bar */}
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Body lines */}
            <div className="space-y-4">
              <div className="h-7 w-64 bg-muted rounded animate-pulse" />
              {[100, 95, 88, 100, 92, 86, 98, 90, 75, 100, 93, 87].map(
                (w, i) => (
                  <div
                    key={i}
                    className="h-4 bg-muted rounded animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                ),
              )}
              <div className="h-7 w-48 bg-muted rounded animate-pulse mt-8" />
              {[100, 92, 97, 85, 100, 90].map((w, i) => (
                <div
                  key={`b-${i}`}
                  className="h-4 bg-muted rounded animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-10 lg:mt-0 hidden lg:block">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <div className="h-5 w-36 bg-muted rounded animate-pulse mb-5" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${i < 3 ? 'pb-4 mb-4 border-b border-gray-100' : ''}`}
                >
                  <div className="w-[72px] h-[52px] bg-muted rounded-xl animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
