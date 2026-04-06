export default function LoadingArticle() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-20 bg-muted rounded animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
              {/* Hero image */}
              <div className="aspect-[16/9] bg-muted animate-pulse" />

              <div className="p-6 md:p-8 space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
                {/* Title */}
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
                <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
                {/* Subtitle box */}
                <div className="border-l-4 border-muted p-4 rounded-r-lg bg-muted/30">
                  <div className="h-5 w-full bg-muted rounded animate-pulse" />
                  <div className="h-5 w-4/5 bg-muted rounded animate-pulse mt-2" />
                </div>
                {/* Body lines */}
                <div className="space-y-3 pt-4">
                  {[100, 95, 88, 100, 92, 86, 98, 90].map((w, i) => (
                    <div
                      key={i}
                      className="h-4 bg-muted rounded animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="w-24 aspect-video bg-muted rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
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
