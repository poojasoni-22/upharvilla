"use client";

import { ArrowUpDown, Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const PRICE_RANGES = [
  { label: "₹300 – ₹700", min: "300", max: "700" },
  { label: "₹700 – ₹900", min: "700", max: "900" },
  { label: "₹900 – ₹1,200", min: "900", max: "1200" },
  { label: "₹1,200 – ₹1,800", min: "1200", max: "1800" },
  { label: "₹1,800 – ₹2,500", min: "1800", max: "2500" },
  { label: "₹2,500+", min: "2500", max: "" },
];

const RATING_OPTIONS = [2, 3, 4, 5] as const;

interface ProductFiltersProps {
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minRating?: number | null;
  setMinRating?: (val: number | null) => void;
  searchTerm?: string;
}

function StarRating({ count, filled }: { count: number; filled: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          } ${filled && i < count ? "fill-amber-500 text-amber-500" : ""}`}
        />
      ))}
    </div>
  );
}

export default function ProductFilters({
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  searchTerm,
}: ProductFiltersProps) {
  const selectedRangeKey =
    minPrice || maxPrice
      ? (PRICE_RANGES.find((r) => r.min === minPrice && r.max === maxPrice)
          ?.label ?? null)
      : null;

  const handlePriceRange = (range: (typeof PRICE_RANGES)[number]) => {
    if (selectedRangeKey === range.label) {
      // deselect
      setMinPrice("");
      setMaxPrice("");
    } else {
      setMinPrice(range.min);
      setMaxPrice(range.max);
    }
  };

  const handleRating = (rating: number) => {
    if (setMinRating) {
      setMinRating(minRating === rating ? null : rating);
    }
  };

  const visibleSortOptions = SORT_OPTIONS.filter(
    (opt) => opt.value !== "relevance" || searchTerm,
  );

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.12em] flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3" />
          Sort By
        </Label>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-full h-9 text-sm bg-white border-neutral-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visibleSortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Price Range */}
      <div className="space-y-2.5">
        <Label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.12em]">
          Price Range (₹)
        </Label>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedRangeKey === range.label;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => handlePriceRange(range)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900 font-medium"
                    : "bg-white text-neutral-600 border-neutral-150 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Rating Filter */}
      {setMinRating && (
        <div className="space-y-2.5">
          <Label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.12em]">
            Customer Ratings
          </Label>
          <div className="flex flex-col gap-1.5">
            {RATING_OPTIONS.map((rating) => {
              const isSelected = minRating === rating;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRating(rating)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer border flex items-center gap-2 ${
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-150 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <StarRating count={rating} filled={isSelected} />
                  <span
                    className={`text-xs ${isSelected ? "text-white" : "text-neutral-500"}`}
                  >
                    {rating}+ &amp; above
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
