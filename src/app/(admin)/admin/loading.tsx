export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-neutral-200/60 rounded-lg" />
        <div className="h-3 w-64 bg-neutral-100 rounded" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-16 bg-neutral-100 rounded" />
              <div className="h-4 w-12 bg-neutral-200/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-neutral-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-neutral-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-neutral-200/60 rounded" />
              <div className="h-2.5 w-1/2 bg-neutral-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-neutral-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
