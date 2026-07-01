"use client";

import { useQuery } from "convex/react";
import {
  ChevronRight,
  PackageOpen,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../convex/_generated/api";
import ProductCard from "../components/ProductCard";
import RelationshipSelector from "../components/RelationshipSelector";
import ProductFilters, {
  SORT_OPTIONS,
  type SortOption,
} from "./ProductFilters";
import ProductHeroSlider from "./ProductHeroSlider";

interface ProductListingProps {
  defaultTag?: string;
  useNewArrivals?: boolean;
}

export default function ProductListing({
  defaultTag,
  useNewArrivals = false,
}: ProductListingProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read filters from URL (reactive — these change on every navigation)
  const tagParam = searchParams.get("tag") || defaultTag || "";
  const sortParam = (searchParams.get("sort") ||
    (searchParams.get("search") ? "relevance" : "newest")) as SortOption;
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const searchParam = searchParams.get("search") || "";
  const [selectedTags, setSelectedTags] = useState<string[]>(
    tagParam
      ? tagParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  );
  const [sortBy, setSortByState] = useState<SortOption>(
    SORT_OPTIONS.find((o) => o.value === sortParam)
      ? sortParam
      : searchParam
        ? "relevance"
        : "newest",
  );
  const [minPrice, setMinPriceState] = useState(minPriceParam);
  const [maxPrice, setMaxPriceState] = useState(maxPriceParam);
  const [searchTerm, setSearchTermState] = useState(searchParam);

  const ratingParam = searchParams.get("rating");
  const [minRating, setMinRatingState] = useState<number | null>(
    ratingParam ? Number(ratingParam) : null,
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Infinite scroll state
  const ITEMS_PER_BATCH = 20;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── FIX 4: Re-sync ALL state whenever the URL searchParams change ──
  useEffect(() => {
    const tag = searchParams.get("tag") || defaultTag || "";
    setSelectedTags(
      tag
        ? tag
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    );
    const sort = (searchParams.get("sort") ||
      (searchParams.get("search") ? "relevance" : "newest")) as SortOption;
    setSortByState(
      SORT_OPTIONS.find((o) => o.value === sort)
        ? sort
        : searchParams.get("search")
          ? "relevance"
          : "newest",
    );
    setMinPriceState(searchParams.get("minPrice") || "");
    setMaxPriceState(searchParams.get("maxPrice") || "");
    setSearchTermState(searchParams.get("search") || "");

    const ratingVal = searchParams.get("rating");
    setMinRatingState(ratingVal ? Number(ratingVal) : null);

    // Reset visible count when filters change
    setVisibleCount(ITEMS_PER_BATCH);
  }, [searchParams, defaultTag]);

  // Determine base path for URL routing
  const basePath = useNewArrivals ? "/new-arrivals" : "/products";

  // URL State Mutators
  const setSortBy = useCallback(
    (sort: SortOption) => {
      const params = new URLSearchParams(window.location.search);
      params.set("sort", sort);
      params.delete("page");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, basePath],
  );

  const setMinPrice = useCallback(
    (min: string) => {
      const params = new URLSearchParams(window.location.search);
      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }
      params.delete("page");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, basePath],
  );

  const setMaxPrice = useCallback(
    (max: string) => {
      const params = new URLSearchParams(window.location.search);
      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
      params.delete("page");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, basePath],
  );

  const setMinRating = useCallback(
    (rating: number | null) => {
      const params = new URLSearchParams(window.location.search);
      if (rating) {
        params.set("rating", String(rating));
      } else {
        params.delete("rating");
      }
      params.delete("page");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, basePath],
  );

  // Build query args for filtered products
  const categoryParam = searchParams.get("category") || "";
  const flagParam = searchParams.get("flag") || "";

  const queryArgs = useMemo(() => {
    const args: Record<string, unknown> = { sortBy };
    if (selectedTags.length > 0) args.tags = selectedTags;
    if (minPrice) args.minPrice = Number(minPrice);
    if (maxPrice) args.maxPrice = Number(maxPrice);
    if (searchTerm) args.searchTerm = searchTerm;
    if (categoryParam) args.category = categoryParam;
    if (flagParam) args.flag = flagParam;
    return args;
  }, [
    selectedTags,
    sortBy,
    minPrice,
    maxPrice,
    searchTerm,
    categoryParam,
    flagParam,
  ]);

  // Fetch data — use getNewArrivals when in new arrivals mode, otherwise getFilteredProducts
  const filteredProducts = useQuery(
    api.products.getFilteredProducts,
    useNewArrivals ? "skip" : queryArgs,
  );
  const newArrivalProducts = useQuery(
    api.products.getNewArrivals,
    useNewArrivals ? { strict: true } : "skip",
  );
  const rawProducts = useNewArrivals ? newArrivalProducts : filteredProducts;
  const isLoading = rawProducts === undefined;

  // Apply client-side filters (price, rating, sort for new arrivals mode)
  const productList = useMemo(() => {
    let list = rawProducts ? [...rawProducts] : [];

    // For new arrivals mode, apply price/sort/tag filters client-side
    if (useNewArrivals) {
      if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
      if (selectedTags.length > 0) {
        list = list.filter((p) =>
          selectedTags.every((tag) => p.tags.includes(tag)),
        );
      }

      // Sort
      switch (sortBy) {
        case "price_asc":
          list.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          list.sort((a, b) => b.price - a.price);
          break;
        case "name":
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          list.sort((a, b) => b.launchedAt - a.launchedAt);
          break;
      }
    }

    // Apply rating filter
    if (minRating) {
      list = list.filter(
        (p) =>
          (p as { rating?: number }).rating == null ||
          ((p as { rating?: number }).rating ?? 5) >= minRating,
      );
    }
    return list;
  }, [
    rawProducts,
    minRating,
    useNewArrivals,
    minPrice,
    maxPrice,
    selectedTags,
    sortBy,
  ]);

  // Infinite scroll — show products up to visibleCount
  const visibleProducts = useMemo(
    () => productList.slice(0, visibleCount),
    [productList, visibleCount],
  );
  const hasMore = visibleCount < productList.length;

  // IntersectionObserver for infinite scroll (throttled)
  const isLoadingMore = useRef(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore.current) {
          isLoadingMore.current = true;
          startTransition(() => {
            setVisibleCount((prev) =>
              Math.min(prev + ITEMS_PER_BATCH, productList.length),
            );
          });
          // Throttle: prevent re-trigger for 200ms
          setTimeout(() => {
            isLoadingMore.current = false;
          }, 200);
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, productList.length]);

  const hasActiveFilters =
    selectedTags.length > 0 ||
    minPrice ||
    maxPrice ||
    searchTerm ||
    minRating ||
    categoryParam ||
    flagParam;

  const handleTagToggle = useCallback(
    (tag: string) => {
      setSelectedTags((prev) => {
        const next = prev.includes(tag) ? [] : [tag];
        const params = new URLSearchParams(window.location.search);
        params.delete("page");
        if (next.length > 0) {
          params.set("tag", next.join(","));
        } else {
          params.delete("tag");
        }
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
        return next;
      });
    },
    [router, basePath],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedTags([]);
    setSortByState("newest");
    setMinPriceState("");
    setMaxPriceState("");
    setSearchTermState("");
    setMinRatingState(null);
    router.replace(basePath, { scroll: false });
  }, [router, basePath]);

  // Human-readable labels for flag and category params
  const FLAG_LABELS: Record<string, string> = {
    "new-arrival": "New Arrivals",
    trending: "Trending",
    "most-sold": "Most Sold",
    "most-purchased": "Most Purchased",
  };
  const CATEGORY_LABELS: Record<string, string> = {
    "customized-gifts": "Customized Gifts",
    "corporate-gifts": "Corporate Gifts",
    hampers: "Hampers",
    "frames-bouquet": "Frames & Bouquet",
    "shop-by-occasion": "Shop by Occasion",
    "new-arrivals": "New Arrivals",
  };

  const pageTitle = useNewArrivals
    ? "New Arrivals"
    : flagParam
      ? FLAG_LABELS[flagParam] || flagParam
      : categoryParam
        ? CATEGORY_LABELS[categoryParam] || categoryParam
        : selectedTags.length > 0
          ? selectedTags.join(" & ")
          : "All Products";

  return (
    <div className="min-h-[50vh] bg-white">
      {/* ── FIX 3: Hero Image Slider ── */}
      <ProductHeroSlider />
      {/* Path Indicator / Breadcrumbs */}
      <div className="px-6 md:px-12 lg:px-16 xl:px-20 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-800 font-medium capitalize">
            {pageTitle}
          </span>
        </nav>
      </div>
      {/* Relationship Quick Filter Bar */}
      <RelationshipSelector
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      {/* Main Content: Sidebar Filters + Product Grid */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 xl:px-20 pb-16 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 lg:w-64 xl:w-72 shrink-0">
          <div className="sticky top-[140px] space-y-1 bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <ProductFilters
              sortBy={sortBy}
              setSortBy={setSortBy}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              searchTerm={searchTerm}
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter bar */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {(selectedTags.length > 0 ? 1 : 0) +
                    (minPrice || maxPrice ? 1 : 0) +
                    (sortBy !== "newest" ? 1 : 0) +
                    (minRating ? 1 : 0) +
                    (categoryParam ? 1 : 0) +
                    (flagParam ? 1 : 0)}
                </span>
              )}
            </button>

            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-neutral-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.filter(
                  (opt) => opt.value !== "relevance" || searchTerm,
                ).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter panel */}
          {showMobileFilters && (
            <div className="md:hidden mb-6 bg-neutral-50/80 rounded-xl border border-neutral-100 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-800">
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ProductFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minRating={minRating}
                setMinRating={setMinRating}
                searchTerm={searchTerm}
              />
            </div>
          )}

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {/* Active category filter */}
              {categoryParam && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200"
                >
                  {CATEGORY_LABELS[categoryParam] || categoryParam}
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("category");
                      router.replace(url.pathname + url.search, {
                        scroll: false,
                      });
                    }}
                    className="hover:bg-amber-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Active flag filter */}
              {flagParam && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-rose-50 text-rose-700 border-rose-200"
                >
                  {FLAG_LABELS[flagParam] || flagParam}
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("flag");
                      router.replace(url.pathname + url.search, {
                        scroll: false,
                      });
                    }}
                    className="hover:bg-rose-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Active tags */}
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              {/* Active price filter */}
              {(minPrice || maxPrice) && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border-neutral-200"
                >
                  ₹{minPrice || 0} — ₹{maxPrice || "∞"}
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="hover:bg-neutral-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Active rating */}
              {minRating && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border-neutral-200"
                >
                  {minRating}★ &amp; above
                  <button
                    type="button"
                    onClick={() => setMinRating(null)}
                    className="hover:bg-neutral-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Active search */}
              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20"
                >
                  Search: &quot;{searchTerm}&quot;
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTermState("");
                      const url = new URL(window.location.href);
                      url.searchParams.delete("search");
                      router.replace(url.pathname + url.search, {
                        scroll: false,
                      });
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Clear all */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[3/4] rounded-xl bg-neutral-100" />
                  <Skeleton className="h-4 w-3/4 rounded-md bg-neutral-100" />
                  <Skeleton className="h-3 w-1/2 rounded-md bg-neutral-100" />
                  <Skeleton className="h-4 w-1/3 rounded-md bg-neutral-100" />
                </div>
              ))}
            </div>
          ) : productList.length > 0 ? (
            <>
              <div
                id="product-grid"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-7"
              >
                {visibleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Infinite scroll sentinel + product count */}
              <div className="mt-8 flex flex-col items-center gap-3">
                {hasMore ? (
                  <>
                    <div ref={sentinelRef} className="w-full h-1" />
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading more products...
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-neutral-400 font-medium">
                    Showing all {productList.length} products
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
                <PackageOpen className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                No products found
              </h3>
              <p className="text-neutral-500 text-sm text-center max-w-md mb-8">
                We couldn&apos;t find any products matching your filters. Try
                adjusting or clearing them!
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
