export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery skeleton */}
            <div className="aspect-video bg-muted rounded-xl animate-pulse" />
            {/* Thumbnail strip */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-20 h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            {/* Details card skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="h-10 w-40 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-secondary/20 rounded-xl animate-pulse" />
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
