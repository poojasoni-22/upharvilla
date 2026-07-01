"use client";

import { useQuery } from "convex/react";
import { ArrowRight, ChevronRight, Flame, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/modules/user/components/ProductCard";
import RelationshipSelector from "@/modules/user/components/RelationshipSelector";
import { api } from "../../../../convex/_generated/api";

export default function TrendingPage() {
  const products = useQuery(api.products.getTrending, {});
  const isLoading = products === undefined;
  const productList = products ?? [];
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredProducts = selectedTag
    ? productList.filter((p) => p.tags.includes(selectedTag))
    : productList;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-800 font-medium">
            {selectedTag ? `Trending Gifts > ${selectedTag}` : "Trending Gifts"}
          </span>
        </nav>
      </div>

      {/* Hero Banner */}
      <div className="relative mb-8 mx-6 md:mx-12 mt-4 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/40 to-pink-50/30 border border-purple-200/50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-200/20 rounded-full blur-3xl" />
          <div className="absolute top-10 left-1/3 w-4 h-4 bg-purple-300/40 rounded-full" />
          <div className="absolute bottom-16 right-1/4 w-3 h-3 bg-pink-300/40 rounded-full" />
          <div className="absolute top-1/2 right-10 w-2 h-2 bg-purple-400/30 rounded-full" />
        </div>
        <div className="relative z-10 px-8 md:px-16 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">
              <Flame className="w-3.5 h-3.5 text-purple-500" />
              What's Hot
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
              Trending Gifts
            </h1>
            <p className="mt-3 text-neutral-600 text-sm md:text-base max-w-lg leading-relaxed">
              Explore our most loved and highly popular gift items — selected by
              thousands of customers to bring smiles to their loved ones.
            </p>
            {!isLoading && (
              <p className="mt-2 text-xs text-neutral-400">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"} found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Relationship Quick Filter Bar */}
      <div className="mb-6">
        <RelationshipSelector
          selectedTags={selectedTag ? [selectedTag] : []}
          onTagToggle={(tag) =>
            setSelectedTag(selectedTag === tag ? null : tag)
          }
        />
      </div>

      {/* Product Grid */}
      <div className="px-6 md:px-12 pb-16">
        {isLoading ? (
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              {selectedTag
                ? "No matching trending gifts"
                : "No trending products yet"}
            </h3>
            <p className="text-neutral-500 text-sm text-center max-w-md mb-8">
              {selectedTag
                ? `We couldn't find any trending gifts matching "${selectedTag}". Try selecting another relationship or clearing the filter!`
                : "We're updating our collection of popular items. Check back soon for our highly requested drops!"}
            </p>
            {selectedTag ? (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear Relationship Filter
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
