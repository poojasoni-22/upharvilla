"use client";

import { useQuery } from "convex/react";
import { Filter, Loader2, Package, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";

const CATEGORIES_MAP: Record<string, string> = {
  "customized-gifts": "Customized Gifts",
  "corporate-gifts": "Corporate Gifts",
  hampers: "Hampers",
  "frames-bouquet": "Frames & Bouquet",
  "shop-by-occasion": "Shop by Occasion",
};

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "customized-gifts": [
    "Customized Photo Gifts",
    "Customized Couple Gifts",
    "Customized Jewelry",
    "Customized Fashion Gifts",
    "Customized Home Decor",
    "Customized Drinkware",
    "Customized Kids Gifts",
  ],
  "corporate-gifts": [
    "Employee Welcome Kits",
    "Employee Appreciation Gifts",
    "Work From Home Gifts",
    "Client Gifts",
    "Executive Gifts",
    "Customized Branding Gifts",
    "Eco-Friendly Gifts",
    "Office Desk Essentials",
    "Festive Corporate Gifts",
  ],
  hampers: [
    "Birthday Hampers",
    "Wedding Hampers",
    "Couple Hampers",
    "Festive Hampers",
    "Corporate Hampers",
    "Luxury Hampers",
    "Baby & Kids Hampers",
    "Customized Hampers",
  ],
  "frames-bouquet": [
    "Photo Frames",
    "LED Frames",
    "Acrylic Frames",
    "Fresh Flower Bouquet",
    "Artificial Bouquet",
    "Frame + Bouquet Combo",
  ],
  "shop-by-occasion": [] as string[], // ← populated dynamically from active occasions DB
};

export { CATEGORIES_MAP, SUBCATEGORIES_MAP };

interface ProductTableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  subCategoryFilter: string;
  onSubCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  compact?: boolean;
  onOpenDetails?: (id: string, editMode?: boolean) => void;
}

export function ProductTableFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  subCategoryFilter,
  onSubCategoryChange,
  statusFilter,
  onStatusChange,
  compact = false,
  onOpenDetails,
}: ProductTableFiltersProps) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search logic for live suggestions
  const debouncedSearch = useDebounce(search, 300);
  const isSearchActive = debouncedSearch.trim().length >= 2;
  const searchResults = useQuery(
    api.products.search,
    isSearchActive
      ? { searchTerm: debouncedSearch, includeInactive: true }
      : "skip",
  );
  const isSearching = isSearchActive && searchResults === undefined;

  // ── Dynamic occasion subcategories from DB ──
  const activeOccasions = useQuery(api.occasions.getOccasions);

  // Helper: get subcategory options for a given category filter
  const getSubcategoryOptions = (cat: string): string[] => {
    if (cat === "shop-by-occasion" && activeOccasions) {
      return activeOccasions.map((o) => o.label);
    }
    return SUBCATEGORIES_MAP[cat] ?? [];
  };

  // Handle click outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
        {/* Row 1: Search + Category */}
        <div ref={containerRef} className="relative bg-card">
          <Search
            size={11}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            id="product-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="pl-6 h-7 text-xs w-full sm:w-36"
          />
          {isFocused && (
            <div className="absolute top-full right-0 mt-1.5 w-80 bg-white border border-neutral-200 shadow-2xl rounded-2xl p-3 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-150">
              {isSearching && (
                <div className="flex items-center justify-center py-4 text-[11px] text-neutral-500 gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Searching...
                </div>
              )}

              {!isSearching && isSearchActive && searchResults && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">
                    Suggested Products
                  </h3>
                  {searchResults.length === 0 ? (
                    <div className="text-xs text-neutral-500 py-2">
                      No products found
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto pr-0.5">
                      {searchResults.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => {
                            setIsFocused(false);
                            if (onOpenDetails) {
                              onOpenDetails(product._id, false);
                            }
                          }}
                          className="w-full text-left py-2 flex items-center gap-2 hover:bg-neutral-50 px-1.5 rounded-lg transition-all cursor-pointer group"
                        >
                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                            <ProductThumbnailWrapper
                              storageId={product.thumbnail}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-neutral-800 truncate group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-neutral-400 capitalize">
                              {product.category.replace("-", " ")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-neutral-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </p>
                            <span
                              className={`text-[9px] font-bold uppercase ${product.isActive ? "text-emerald-600" : "text-neutral-500"}`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isSearching && !isSearchActive && (
                <div className="text-[10px] text-neutral-450 italic py-1 text-center">
                  Type 2+ characters to search...
                </div>
              )}
            </div>
          )}
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            onCategoryChange(val);
            onSubCategoryChange("all");
          }}
        >
          <SelectTrigger className="w-full sm:w-fit gap-1 h-7 text-xs bg-card">
            <Filter size={10} className="text-muted-foreground shrink-0" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORIES_MAP).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Row 2: Subcategory + Status */}
        <Select
          value={subCategoryFilter}
          onValueChange={onSubCategoryChange}
          disabled={categoryFilter === "all"}
        >
          <SelectTrigger className="w-full sm:w-fit gap-1 h-7 text-xs bg-card">
            <SelectValue
              placeholder={
                categoryFilter === "all" ? "Subcategory" : "All Subcategories"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {categoryFilter !== "all" &&
              getSubcategoryOptions(categoryFilter).map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            id="filter-status"
            className="w-full sm:w-fit h-7 text-xs bg-card"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search */}
      <div
        ref={containerRef}
        className="relative flex-1 min-w-52 max-w-xl bg-card"
      >
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          id="product-search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-8 h-8 text-sm"
        />
        {isFocused && (
          <div className="absolute top-full left-0 mt-1.5 w-full max-w-xl bg-white border border-neutral-200 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-150">
            {isSearching && (
              <div className="flex items-center justify-center py-4 text-xs text-neutral-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Searching...
              </div>
            )}

            {!isSearching && isSearchActive && searchResults && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">
                  Suggested Products
                </h3>
                {searchResults.length === 0 ? (
                  <div className="text-sm text-neutral-500 py-2">
                    No products found
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-150 max-h-60 overflow-y-auto pr-0.5">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => {
                          setIsFocused(false);
                          if (onOpenDetails) {
                            onOpenDetails(product._id, false);
                          }
                        }}
                        className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                          <ProductThumbnailWrapper
                            storageId={product.thumbnail}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800 truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-neutral-400 capitalize">
                            {product.category.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-neutral-900">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase ${product.isActive ? "text-emerald-600" : "text-neutral-500"}`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isSearching && !isSearchActive && (
              <div className="text-xs text-neutral-450 italic py-2 text-center">
                Type 2+ characters to search...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            onCategoryChange(val);
            onSubCategoryChange("all"); // Reset subcategory when category changes
          }}
        >
          <SelectTrigger
            id="filter-category"
            className="w-fit gap-1.5 h-8 text-xs bg-card"
          >
            <Filter size={12} className="text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORIES_MAP).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subcategory Filter */}
        <Select
          value={subCategoryFilter}
          onValueChange={onSubCategoryChange}
          disabled={categoryFilter === "all"}
        >
          <SelectTrigger
            id="filter-subcategory"
            className="w-fit gap-1.5 h-8 text-xs bg-card"
          >
            <SelectValue
              placeholder={
                categoryFilter === "all" ? "Subcategory" : "All Subcategories"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {categoryFilter !== "all" &&
              getSubcategoryOptions(categoryFilter).map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            id="filter-status"
            className="w-fit h-8 text-xs bg-card"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ProductThumbnailWrapper({ storageId }: { storageId?: string }) {
  const isDirectUrl = storageId?.startsWith("http");
  const imageUrl =
    useQuery(
      api.products.getImageUrl,
      storageId && !isDirectUrl ? { storageId } : "skip",
    ) || (isDirectUrl ? storageId : null);

  return (
    <div className="relative h-full w-full bg-muted overflow-hidden flex items-center justify-center">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Product thumbnail"
          className="h-full w-full object-cover"
        />
      ) : (
        <Package size={14} className="text-muted-foreground" />
      )}
    </div>
  );
}
