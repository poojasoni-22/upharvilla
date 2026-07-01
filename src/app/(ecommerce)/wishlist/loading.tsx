export default function WishlistLoading() {
  return (
    <div className="flex-1 bg-background">
      <section className="py-5 md:py-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-5 md:space-y-10">
          <div className="text-center space-y-2 md:space-y-4">
            <div className="h-7 md:h-9 w-40 md:w-52 bg-neutral-100 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 md:h-5 w-64 md:w-80 bg-neutral-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="max-w-[220px] space-y-2">
                <div className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
                <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
