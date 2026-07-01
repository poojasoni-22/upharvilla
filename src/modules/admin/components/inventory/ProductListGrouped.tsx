"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Boxes,
  Calendar,
  ChevronDown,
  CircleDot,
  IndianRupee,
  Layers,
  Package,
  ShoppingBag,
  Tag,
  Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ProductActionMenu } from "./ProductActionMenu";
import { CATEGORIES_MAP } from "./ProductTableFilters";

// Consistent accent for all category groups
const CATEGORY_ACCENT = "bg-[#ad8de9]/60";

const Th = ({
  icon: Icon,
  label,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) => (
  <TableHead className={`border-b border-l first:border-l-0 ${className}`}>
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  </TableHead>
);

const formatDate = (ts: number) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));

interface ProductListGroupedProps {
  search: string;
  categoryFilter: string;
  subCategoryFilter: string;
  statusFilter: string;
  onOpenDetails: (id: string, editMode?: boolean) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
}

export function ProductListGrouped({
  search,
  categoryFilter,
  subCategoryFilter,
  statusFilter,
  onOpenDetails,
  selectedIds,
  onSelectedIdsChange: setSelectedIds,
}: ProductListGroupedProps) {
  const products = useQuery(api.products.list) ?? [];
  const removeProduct = useMutation(api.products.remove);
  const toggleActive = useMutation(api.products.toggleActive);

  const [deleteTarget, setDeleteTarget] = useState<Id<"products"> | null>(null);

  const filtered = products.filter((p) => {
    if (search.trim().length > 0) {
      const term = search.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      if (!matches) return false;
    }
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (subCategoryFilter !== "all" && p.subCategory !== subCategoryFilter)
      return false;
    if (statusFilter !== "all") {
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
    }
    return true;
  });

  const filteredProducts = [...filtered];

  if (search.trim().length > 0) {
    const termLower = search.toLowerCase().trim();
    filteredProducts.sort((a, b) => {
      const getScore = (p: typeof a) => {
        let score = 0;
        const nameLower = p.name.toLowerCase();
        if (nameLower === termLower) score += 100;
        else if (nameLower.startsWith(termLower)) score += 80;
        else if (new RegExp(`\\b${termLower}\\b`, "i").test(nameLower))
          score += 60;
        else if (nameLower.includes(termLower)) score += 40;

        if (p.tags.some((t) => t.toLowerCase() === termLower)) score += 30;
        else if (p.tags.some((t) => t.toLowerCase().includes(termLower)))
          score += 15;

        if (p.subCategory?.toLowerCase().includes(termLower)) score += 10;
        if (p.category.toLowerCase().includes(termLower)) score += 5;
        if (p.description.toLowerCase().includes(termLower)) score += 1;
        return score;
      };
      return getScore(b) - getScore(a);
    });
  }

  const activeCategories = Object.keys(CATEGORIES_MAP).filter(
    (cat) => categoryFilter === "all" || categoryFilter === cat,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProduct({ id: deleteTarget });
      toast.success("Product deleted");
      setDeleteTarget(null);
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

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(p);

  const hasAnyProducts = filteredProducts.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
      {!hasAnyProducts && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
          <Package
            size={32}
            className="text-neutral-200 dark:text-neutral-700 mb-2"
          />
          <p className="text-sm font-medium text-neutral-500">
            No products found
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Try adjusting your filters
          </p>
        </div>
      )}

      {hasAnyProducts &&
        activeCategories.map((catKey) => {
          const catLabel = CATEGORIES_MAP[catKey];
          const catProducts = filteredProducts.filter(
            (p) => p.category === catKey,
          );

          if (
            catProducts.length === 0 &&
            (search.trim() || statusFilter !== "all")
          ) {
            return null;
          }

          const groupIds = catProducts.map((p) => p._id);
          const allGroupSelected =
            groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));

          const toggleGroupAll = () => {
            const next = new Set(selectedIds);
            if (allGroupSelected) {
              groupIds.forEach((id) => next.delete(id));
            } else {
              groupIds.forEach((id) => next.add(id));
            }
            setSelectedIds(next);
          };

          return (
            <CategoryGroup
              key={catKey}
              catKey={catKey}
              catLabel={catLabel}
              catProducts={catProducts}
              allGroupSelected={allGroupSelected}
              onToggleGroupAll={toggleGroupAll}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onOpenDetails={onOpenDetails}
              onToggleActive={(id) => handleToggleActive(id as Id<"products">)}
              onDeleteClick={(id) => setDeleteTarget(id as Id<"products">)}
              formatPrice={formatPrice}
              isEmptyCategory={catProducts.length === 0}
            />
          );
        })}

      {/* Delete Confirmation */}
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
              be undone.
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
    </div>
  );
}

/* -- Category Group (its own collapsible section with table) -- */
interface CategoryGroupProps {
  catKey: string;
  catLabel: string;
  catProducts: any[];
  allGroupSelected: boolean;
  onToggleGroupAll: () => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  onOpenDetails: (id: string, editMode?: boolean) => void;
  onToggleActive: (id: string) => void;
  onDeleteClick: (id: string) => void;
  formatPrice: (p: number) => string;
  isEmptyCategory: boolean;
}

function CategoryGroup({
  catKey,
  catLabel,
  catProducts,
  allGroupSelected,
  onToggleGroupAll,
  selectedIds,
  setSelectedIds,
  onOpenDetails,
  onToggleActive,
  onDeleteClick,
  formatPrice,
  isEmptyCategory,
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div>
      {/* Group Header */}
      <div
        className="flex items-center justify-between mb-3 px-4 dark:bg-neutral-800 bg-neutral-200/55 py-1.5 rounded-md cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 w-full">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground bg-muted rounded transition-transform duration-200",
              !isExpanded && "-rotate-90",
            )}
          />
          <div
            className={cn("w-1 h-5 rounded-full shrink-0", CATEGORY_ACCENT)}
          />
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
            {catLabel}
            <span className="text-[10px] font-medium text-muted-foreground dark:bg-muted bg-neutral-100 px-1.5 py-0.5 rounded">
              {catProducts.length}
            </span>
          </h2>
        </div>
      </div>

      {/* Animated Table */}
      {isExpanded && (
        <div
          className="table-scroll-x"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <Table className="border-t border-b dark:border-neutral-700 border-neutral-200 min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 border-b">
                  <Checkbox
                    checked={allGroupSelected}
                    onCheckedChange={onToggleGroupAll}
                  />
                </TableHead>
                <TableHead className="w-9 border-b border-l text-[10px] font-semibold text-muted-foreground text-center">
                  #
                </TableHead>
                <Th icon={ShoppingBag} label="Product" />
                <Th icon={Layers} label="Subcategory" />
                <Th icon={IndianRupee} label="Price" />
                <Th icon={Boxes} label="Stock" />
                <Th icon={Tag} label="Tags" />
                <Th icon={CircleDot} label="Status" />
                <Th icon={Calendar} label="Added" />
                <TableHead className="w-24 text-center border-b border-l">
                  <span className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Zap size={12} />
                    Actions
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isEmptyCategory ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No products in this category yet.
                  </TableCell>
                </TableRow>
              ) : (
                catProducts.map((product, idx) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    rowIndex={idx + 1}
                    isSelected={selectedIds.has(product._id)}
                    onSelect={() => toggleSelect(product._id)}
                    onOpenDetails={onOpenDetails}
                    onToggleActive={() => onToggleActive(product._id)}
                    onDeleteClick={() => onDeleteClick(product._id)}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* -- Product Row -- */
interface ProductRowProps {
  product: any;
  rowIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: (id: string, editMode?: boolean) => void;
  onToggleActive: () => void;
  onDeleteClick: () => void;
  formatPrice: (p: number) => string;
  formatDate: (ts: number) => string;
}

function ProductRow({
  product,
  rowIndex,
  isSelected,
  onSelect,
  onOpenDetails,
  onToggleActive,
  onDeleteClick,
  formatPrice,
  formatDate,
}: ProductRowProps) {
  const thumbnail = product.thumbnail;
  const isDirectUrl = thumbnail?.startsWith("http");
  const imageUrl =
    useQuery(
      api.products.getImageUrl,
      thumbnail && !isDirectUrl ? { storageId: thumbnail } : "skip",
    ) || (isDirectUrl ? thumbnail : null);

  return (
    <TableRow
      className={cn(
        "group border-none dark:hover:bg-neutral-900 hover:bg-muted/30 transition-all duration-150 cursor-pointer",
        isSelected && "bg-primary/5",
      )}
      onClick={() => onOpenDetails(product._id, false)}
    >
      {/* 1. Checkbox */}
      <TableCell className="border-b" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>

      {/* 2. Row Number */}
      <TableCell className="border-b border-l text-center text-[10px] font-medium text-neutral-450 dark:text-neutral-500 tabular-nums w-9">
        {rowIndex}
      </TableCell>

      {/* 3. Product Name */}
      <TableCell className="border-b border-l">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden flex items-center justify-center shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package size={16} className="text-neutral-300" />
            )}
          </div>
          <span className="font-medium text-foreground truncate max-w-48">
            {product.name}
          </span>
        </div>
      </TableCell>

      {/* 4. Subcategory */}
      <TableCell className="border-b border-l">
        {product.subCategory ? (
          <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
            {product.subCategory}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-400 italic">None</span>
        )}
      </TableCell>

      {/* 5. Price */}
      <TableCell className="font-medium tabular-nums border-b border-l">
        {formatPrice(product.price)}
      </TableCell>

      {/* 6. Stock */}
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

      {/* 7. Tags */}
      <TableCell className="border-b border-l">
        <div className="flex flex-wrap gap-1 max-w-40">
          {product.tags?.slice(0, 2).map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[9px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
          {product.tags?.length > 2 && (
            <Badge variant="ghost" className="text-[9px] px-1 py-0">
              +{product.tags.length - 2}
            </Badge>
          )}
          {(!product.tags || product.tags.length === 0) && (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>

      {/* 8. Status */}
      <TableCell className="border-b border-l">
        <span
          className={`text-[10px] uppercase font-bold tracking-wider ${
            product.isActive ? "text-emerald-600" : "text-neutral-500"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>

      {/* 9. Added Date */}
      <TableCell className="text-muted-foreground border-b border-l">
        {formatDate(product.launchedAt)}
      </TableCell>

      {/* 10. Actions */}
      <TableCell
        className="text-center border-b border-l"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <ProductActionMenu
            productId={product._id}
            isActive={product.isActive}
            onOpenDetails={onOpenDetails}
            onToggleActive={onToggleActive}
            onDeleteClick={onDeleteClick}
            triggerClassName="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            align="center"
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
