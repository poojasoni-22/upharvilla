"use client";

import { useMutation } from "convex/react";
import { List, Package, Table2, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/modules/admin/components/inventory/AddProductDialog";
import { ProductDetailsSheet } from "@/modules/admin/components/inventory/ProductDetailsSheet";
import { ProductListGrouped } from "@/modules/admin/components/inventory/ProductListGrouped";
import { ProductTable } from "@/modules/admin/components/inventory/ProductTable";
import { ProductTableFilters } from "@/modules/admin/components/inventory/ProductTableFilters";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const InventoryPage = () => {
  const [view, setView] = useState<"list" | "table">("list");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Shared selection state (lifted from table/list components)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Details sheet state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetDefaultEditMode, setSheetDefaultEditMode] = useState(false);

  const bulkRemove = useMutation(api.products.bulkRemove);

  const handleOpenDetails = (id: string, defaultEditMode = false) => {
    setSelectedProductId(id);
    setSheetDefaultEditMode(defaultEditMode);
    setIsSheetOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds) as Id<"products">[];
      await bulkRemove({ ids });
      toast.success(
        `${ids.length} product${ids.length > 1 ? "s" : ""} deleted successfully`,
      );
      setSelectedIds(new Set());
      setShowBulkDeleteDialog(false);
    } catch {
      toast.error("Failed to delete products");
    }
  };

  // Clear selection when switching views
  const handleViewChange = (v: "list" | "table") => {
    setSelectedIds(new Set());
    setView(v);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <Package className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
              Inventory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Manage your product catalog, active listings, and stock levels.
            </p>
          </div>
        </div>
        <AddProductDialog />
      </div>

      {/* Tabs + Filters in one compact row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-neutral-200/60 dark:border-neutral-800">
        {/* Tab Switcher */}
        <div className="flex items-center gap-0.5 shrink-0">
          {(["list", "table"] as const).map((v) => {
            const Icon = v === "list" ? List : Table2;
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            return (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 -mb-[1px] cursor-pointer ${
                  view === v
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Inline Filters + Bulk Delete */}
        <div className="flex items-center gap-2 pb-1.5 flex-1 min-w-0 justify-end">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="h-7 text-xs gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white animate-in fade-in slide-in-from-right-2 duration-200"
            >
              <Trash2 size={12} />
              Delete ({selectedIds.size})
            </Button>
          )}
          <ProductTableFilters
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            subCategoryFilter={subCategoryFilter}
            onSubCategoryChange={setSubCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            compact
            onOpenDetails={handleOpenDetails}
          />
        </div>
      </div>

      {/* Main View Area */}
      {view === "list" && (
        <ProductListGrouped
          search={search}
          categoryFilter={categoryFilter}
          subCategoryFilter={subCategoryFilter}
          statusFilter={statusFilter}
          onOpenDetails={handleOpenDetails}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      )}
      {view === "table" && (
        <ProductTable
          search={search}
          categoryFilter={categoryFilter}
          subCategoryFilter={subCategoryFilter}
          statusFilter={statusFilter}
          onOpenDetails={handleOpenDetails}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      )}

      {/* Details Sheet hosted globally on the page */}
      <ProductDetailsSheet
        productId={selectedProductId}
        isOpen={isSheetOpen}
        defaultEditMode={sheetDefaultEditMode}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedProductId(null);
        }}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-neutral-800">
              Delete {selectedIds.size} Product{selectedIds.size > 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-sm">
              Are you sure you want to delete{" "}
              {selectedIds.size === 1
                ? "this product"
                : `these ${selectedIds.size} products`}
              ? This action cannot be undone and will remove{" "}
              {selectedIds.size === 1 ? "it" : "them"} permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryPage;
