"use client";

import { StarIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const ITEMS_PER_PAGE = 20;

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type SortKey = "newest" | "oldest" | "highest" | "lowest";

export default function ReviewsManagementPage() {
  const {
    results: reviews,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.reviews.listReviewsPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );
  const deleteReview = useMutation(api.reviews.deleteReview);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const processed = useMemo(() => {
    if (!reviews) return [];
    let filtered = reviews;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.reviewText.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q),
      );
    }

    if (filterRating !== null) {
      filtered = filtered.filter((r) => r.rating === filterRating);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "highest":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [reviews, debouncedSearch, sortBy, filterRating]);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { total: 0, avg: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    }
    return {
      total: reviews.length,
      avg: Math.round((sum / reviews.length) * 10) / 10,
      distribution,
    };
  }, [reviews]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteReview({ id: id as Id<"reviews"> });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:h-[calc(100vh-80px)] px-1 sm:px-4 pt-2 gap-4">
        <div className="flex items-start gap-2">
          <Star className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Reviews
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-80px)] px-1 sm:px-4 pt-2 lg:overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 shrink-0">
        <div className="flex items-start gap-2">
          <Star className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Reviews
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Moderate customer reviews and monitor product sentiment.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 shrink-0 animate-in fade-in duration-300">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={StarIcon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Avg Rating
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.avg}
              <span className="text-xs text-neutral-400 font-normal ml-1">
                / 5
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              Total Reviews
            </p>
            <p className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs col-span-2">
          <div className="flex items-center gap-3 h-full">
            {stats.distribution.map((count, i) => {
              const maxCount = Math.max(...stats.distribution, 1);
              const height = Math.max((count / maxCount) * 100, 8);
              return (
                <button
                  key={`bar-${i}`}
                  type="button"
                  onClick={() =>
                    setFilterRating(filterRating === i + 1 ? null : i + 1)
                  }
                  className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                    filterRating !== null && filterRating !== i + 1
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                >
                  <span className="text-[9px] font-bold text-neutral-500 font-mono">
                    {count}
                  </span>
                  <div className="w-full bg-neutral-100 rounded-full overflow-hidden h-10 flex items-end">
                    <div
                      className="w-full rounded-full transition-all duration-300 bg-primary/60"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {i + 1}
                    </span>
                    <Star
                      className="w-2.5 h-2.5 text-primary"
                      fill="currentColor"
                      stroke="none"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-neutral-200/60 pb-2.5 mt-4 shrink-0">
        <div className="flex items-center gap-0.5">
          {(
            [
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "highest", label: "Highest" },
              { key: "lowest", label: "Lowest" },
            ] as { key: SortKey; label: string }[]
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 -mb-[1px] cursor-pointer ${
                sortBy === opt.key
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-1.5">
          {filterRating !== null && (
            <button
              type="button"
              onClick={() => setFilterRating(null)}
              className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              {filterRating}★ filter ×
            </button>
          )}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3 h-3 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-neutral-50/50 border-neutral-200/70 h-7 text-xs w-full sm:w-56 rounded-lg focus-visible:ring-1 focus-visible:ring-[#ad8de9] focus-visible:border-[#ad8de9] placeholder:text-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Reviews List — fills remaining viewport, scrollable */}
      <div className="mt-3 min-h-0 flex-1 pb-4 flex flex-col">
        {processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-neutral-200 rounded-xl">
            <Star className="w-12 h-12 text-neutral-200 mb-4" />
            <h3 className="text-sm font-medium text-neutral-500">
              No reviews found
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {search || filterRating
                ? "Try different filters."
                : "No reviews yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1.5">
            {processed.map((review, index) => (
              <div
                key={review._id}
                className="p-3.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:shadow-xs transition-all shrink-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-[10px] font-bold text-neutral-300 font-mono shrink-0 w-4 text-right mt-1">
                      {index + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-neutral-500">
                        {review.userInitials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-neutral-800">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={`s-${i}`}
                              className="w-2.5 h-2.5"
                              fill={i < review.rating ? "#ad8de9" : "#e5e5e5"}
                              stroke="none"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {timeAgo(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        on {review.productName}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                        {review.reviewText}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                    className="p-2 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {status === "CanLoadMore" &&
              !debouncedSearch.trim() &&
              filterRating === null && (
                <button
                  type="button"
                  onClick={() => loadMore(ITEMS_PER_PAGE)}
                  className="w-full py-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                >
                  Load more
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
