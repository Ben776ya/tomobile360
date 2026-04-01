export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
        {/* Category + date */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-6 w-24 bg-secondary/20 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        {/* Title */}
        <div className="h-10 w-full bg-muted rounded animate-pulse mb-2" />
        <div className="h-10 w-2/3 bg-muted rounded animate-pulse mb-6" />
        {/* Hero image */}
        <div className="aspect-video bg-muted rounded-xl animate-pulse mb-8" />
        {/* Article body lines */}
        <div className="space-y-3">
          {[100, 92, 88, 95, 100, 90, 85, 96].map((width, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
