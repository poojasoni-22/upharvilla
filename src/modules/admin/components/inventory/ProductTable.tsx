"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  Boxes,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDot,
  IndianRupee,
  Layers,
  Loader2,
  Package,
  ShoppingBag,
  Tag,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ProductActionMenu } from "./ProductActionMenu";
import { CATEGORIES_MAP } from "./ProductTableFilters";

const ITEMS_PER_PAGE = 10;
type SortField = "price" | "stock" | "launchedAt" | "relevance";
type SortDir = "asc" | "desc";

interface ProductTableProps {
  search: string;
  categoryFilter: string;
  subCategoryFilter: string;
  statusFilter: string;
  onOpenDetails: (id: string, editMode?: boolean) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
}

export function ProductTable({
  search,
  categoryFilter,
  subCategoryFilter,
  statusFilter,
  onOpenDetails,
  selectedIds,
  onSelectedIdsChange: setSelectedIds,
}: ProductTableProps) {
  // ── Filter & sort state ──
  const [sortField, setSortField] = useState<SortField>("launchedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deleteTarget, setDeleteTarget] = useState<Id<"products"> | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const isSearching = debouncedSearch.trim().length > 0;

  React.useEffect(() => {
    if (isSearching) {
      setSortField("relevance");
      setSortDir("desc");
    } else {
      setSortField("launchedAt");
      setSortDir("desc");
    }
  }, [isSearching]);

  // ── Paginated list (always subscribed — never unmounts) ──
  const {
    results: paginatedProducts,
    status,
    loadMore,
    isLoading: isPaginatedLoading,
  } = usePaginatedQuery(
    api.products.getPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  // ── Search (only fires when there is a term; skipped otherwise) ──
  const searchResults = useQuery(
    api.products.search,
    isSearching
      ? { searchTerm: debouncedSearch, includeInactive: true }
      : "skip",
  );

  const removeProduct = useMutation(api.products.remove);
  const toggleActive = useMutation(api.products.toggleActive);

  // Choose source dataset
  const rawProducts = isSearching
    ? (searchResults ?? [])
    : (paginatedProducts ?? []);

  // Client-side filter + sort on top of the active dataset
  const filtered = [...rawProducts]
    .filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      if (subCategoryFilter !== "all" && p.subCategory !== subCategoryFilter)
        return false;
      if (statusFilter !== "all") {
        if (p.isActive !== (statusFilter === "active")) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "price") {
        cmp = a.price - b.price;
      } else if (sortField === "stock") {
        cmp = a.stock - b.stock;
      } else if (sortField === "relevance") {
        const term = debouncedSearch.toLowerCase().trim();
        const getScore = (p: typeof a) => {
          let score = 0;
          const nameLower = p.name.toLowerCase();
          if (nameLower === term) score += 100;
          else if (nameLower.startsWith(term)) score += 80;
          else if (new RegExp(`\\b${term}\\b`, "i").test(nameLower))
            score += 60;
          else if (nameLower.includes(term)) score += 40;

          if (p.tags.some((t) => t.toLowerCase() === term)) score += 30;
          else if (p.tags.some((t) => t.toLowerCase().includes(term)))
            score += 15;

          if (p.subCategory?.toLowerCase().includes(term)) score += 10;
          if (p.category.toLowerCase().includes(term)) score += 5;
          if (p.description.toLowerCase().includes(term)) score += 1;
          return score;
        };
        cmp = getScore(a) - getScore(b);
      } else {
        cmp = a.launchedAt - b.launchedAt;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  // Loading states:
  // - Table body loading: initial paginated load OR search results pending
  const isTableLoading =
    isPaginatedLoading || (isSearching && searchResults === undefined);

  const [currentPageIndex, setCurrentPageIndex] = useState(1);

  React.useEffect(() => {
    setCurrentPageIndex(1);
  }, []);

  const loadedCount = paginatedProducts?.length ?? 0;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const isDone = status === "Exhausted";
  const startIndex = (currentPageIndex - 1) * ITEMS_PER_PAGE;
  const pageProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (
      currentPageIndex * ITEMS_PER_PAGE >= loadedCount &&
      !isDone &&
      !isSearching
    ) {
      loadMore(ITEMS_PER_PAGE);
    }
    setCurrentPageIndex((p) => p + 1);
  };

  const handlePrevPage = () => {
    setCurrentPageIndex((p) => Math.max(1, p - 1));
  };

  // ── Handlers ──
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filtered.map((p) => p._id)));
    else setSelectedIds(new Set());
  };

  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProduct({ id: deleteTarget });
      toast.success("Product deleted");
      setDeleteTarget(null);
      const n = new Set(selectedIds);
      n.delete(deleteTarget);
      setSelectedIds(n);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleActive = async (id: Id<"products">) => {
    try {
      await toggleActive({ id });
      toast.success("Product status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ── Formatters ──
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(p);

  const formatDate = (ts: number) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(ts));

  // ── Header cell helpers ──
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp size={12} className="text-primary" />
      ) : (
        <ChevronDown size={12} className="text-primary" />
      )
    ) : (
      <ChevronDown
        size={12}
        className="opacity-30 group-hover:opacity-60 transition-opacity"
      />
    );

  const Th = ({
    icon: Icon,
    label,
    sortable,
    className = "",
  }: {
    icon: React.ElementType;
    label: string;
    sortable?: SortField;
    className?: string;
  }) => (
    <TableHead className={`border-b border-l first:border-l-0 ${className}`}>
      {sortable ? (
        <button
          type="button"
          onClick={() => toggleSort(sortable)}
          className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
        >
          <Icon size={12} className="shrink-0" />
          {label}
          <SortIcon field={sortable} />
        </button>
      ) : (
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon size={12} className="shrink-0" />
          {label}
        </span>
      )}
    </TableHead>
  );

  return (
    <>
      {/* ── Table ── */}
      <div className="rounded-xl border bg-card/70 backdrop-blur-sm">
        <div
          className="table-scroll-x"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 border-b">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      filtered.every((p) => selectedIds.has(p._id))
                    }
                    onCheckedChange={(c) => handleSelectAll(c as boolean)}
                  />
                </TableHead>
                <TableHead className="w-9 border-b border-l text-[10px] font-semibold text-muted-foreground text-center">
                  #
                </TableHead>
                <Th icon={ShoppingBag} label="Product" />
                <Th icon={Layers} label="Category" />
                <Th icon={Layers} label="Subcategory" />
                <Th icon={IndianRupee} label="Price" sortable="price" />
                <Th icon={Boxes} label="Stock" sortable="stock" />
                <Th icon={Tag} label="Tags" />
                <Th icon={CircleDot} label="Status" />
                <Th icon={Calendar} label="Added" sortable="launchedAt" />
                <TableHead className="w-24 text-center border-b border-l">
                  <span className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Zap size={12} />
                    Actions
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading state — inside the table, filter bar stays untouched */}
              {isTableLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell className="border-b">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell className="border-b border-l text-center">
                      <Skeleton className="h-3 w-4 mx-auto" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <Skeleton className="h-3.5 w-28" />
                      </div>
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-4 w-16 rounded" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-3.5 w-12" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-3.5 w-8" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <div className="flex gap-1">
                        <Skeleton className="h-4 w-8 rounded-full" />
                        <Skeleton className="h-4 w-8 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell className="border-b border-l">
                      <Skeleton className="h-3.5 w-20" />
                    </TableCell>
                    <TableCell className="border-b border-l text-center">
                      <Skeleton className="h-6 w-6 rounded mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-40 border-b">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Package
                        size={32}
                        strokeWidth={1.2}
                        className="opacity-40"
                      />
                      <p className="text-sm font-medium">No products found</p>
                      <p className="text-xs">
                        {isSearching ||
                        categoryFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Add your first product to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageProducts.map((product, idx) => (
                  <TableRow
                    key={product._id}
                    className={`cursor-pointer transition-colors ${
                      selectedIds.has(product._id)
                        ? "bg-primary/5"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => onOpenDetails(product._id)}
                  >
                    <TableCell
                      className="border-b"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(product._id)}
                        onCheckedChange={(c) =>
                          handleSelect(product._id, c as boolean)
                        }
                      />
                    </TableCell>

                    <TableCell className="border-b border-l text-center text-[10px] font-medium text-muted-foreground tabular-nums w-9">
                      {startIndex + idx + 1}
                    </TableCell>

                    <TableCell className="border-b border-l">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail storageId={product.thumbnail} />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground truncate max-w-48">
                            {product.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="border-b border-l">
                      <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300">
                        {CATEGORIES_MAP[product.category] || product.category}
                      </span>
                    </TableCell>

                    <TableCell className="border-b border-l">
                      {product.subCategory ? (
                        <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                          {product.subCategory}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">
                          None
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-medium tabular-nums border-b border-l">
                      {formatPrice(product.price)}
                    </TableCell>

                    <TableCell className="border-b border-l">
                      {product.stock === 0 ? (
                        <span className="text-red-500 font-medium text-[11px]">
                          Out of stock
                        </span>
                      ) : (
                        <span
                          className={`tabular-nums font-medium ${
                            product.stock < 10
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="border-b border-l">
                      <div className="flex flex-wrap gap-1 max-w-40">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <Badge
                            variant="ghost"
                            className="text-[9px] px-1 py-0"
                          >
                            +{product.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="border-b border-l">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          product.isActive
                            ? "text-emerald-600"
                            : "text-neutral-500"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground border-b border-l">
                      {formatDate(product.launchedAt)}
                    </TableCell>

                    <TableCell
                      className="text-center border-b border-l"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center">
                        <ProductActionMenu
                          productId={product._id}
                          isActive={product.isActive}
                          onOpenDetails={onOpenDetails}
                          onToggleActive={() =>
                            handleToggleActive(product._id as Id<"products">)
                          }
                          onDeleteClick={() =>
                            setDeleteTarget(product._id as Id<"products">)
                          }
                          align="center"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="mt-4 bg-background/90 backdrop-blur-md border px-4 py-2.5 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {startIndex + 1}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handlePrevPage}
              disabled={currentPageIndex <= 1}
              className="h-7 w-7 hover:bg-muted/50"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs text-muted-foreground px-1 tabular-nums">
              <span className="font-semibold text-foreground">
                {currentPageIndex}
              </span>
              {" / "}
              {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleNextPage}
              disabled={currentPageIndex >= totalPages && isDone}
              className="h-7 w-7 hover:bg-muted/50"
            >
              {status === "LoadingMore" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ChevronRight size={14} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-neutral-800">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-sm">
              Are you sure you want to delete this product? This action cannot
              be undone and will remove it permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProductThumbnail({ storageId }: { storageId?: string }) {
  const isDirectUrl = storageId?.startsWith("http");
  const imageUrl =
    useQuery(
      api.products.getImageUrl,
      storageId && !isDirectUrl ? { storageId } : "skip",
    ) || (isDirectUrl ? storageId : null);

  return (
    <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Product thumbnail"
          className="h-full w-full object-cover"
        />
      ) : (
        <Package size={16} className="text-muted-foreground" />
      )}
    </div>
  );
}
