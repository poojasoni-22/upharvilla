export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse mb-6" />

        <div className="flex gap-8">
          {/* Sidebar skeleton (desktop) */}
          <div className="hidden md:block w-56 lg:w-64 shrink-0 space-y-4">
            <div className="h-6 w-24 bg-neutral-100 rounded animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-neutral-100 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-32 bg-neutral-100 rounded animate-pulse" />
              <div className="h-8 w-28 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
                  <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
