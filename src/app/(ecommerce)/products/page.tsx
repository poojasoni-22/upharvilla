import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductListing from "@/modules/user/product/ProductListing";
export const metadata: Metadata = {
  title: "Shop All Gifts",
  description:
    "Browse our complete collection of curated gifts, custom hampers, personalised keepsakes, and corporate gifting at upharVilla. Free delivery across India.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white px-6 md:px-12 pt-24 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square rounded-xl bg-neutral-100" />
                <Skeleton className="h-4 w-3/4 rounded-md bg-neutral-100" />
                <Skeleton className="h-3 w-1/2 rounded-md bg-neutral-100" />
                <Skeleton className="h-4 w-1/3 rounded-md bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ProductListing />
    </Suspense>
  );
}
