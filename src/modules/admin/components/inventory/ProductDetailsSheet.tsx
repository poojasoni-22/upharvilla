"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import React from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ProductEditForm, type ProductEditFormRef } from "./ProductEditForm";
import { ProductViewDetails } from "./ProductViewDetails";

interface ProductDetailsSheetProps {
  productId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEditMode?: boolean;
}

export function ProductDetailsSheet({
  productId,
  isOpen,
  onOpenChange,
  defaultEditMode = false,
}: ProductDetailsSheetProps) {
  // Fetch real-time product data
  const product = useQuery(
    api.products.getById,
    productId ? { id: productId as Id<"products"> } : "skip",
  );

  const toggleActive = useMutation(api.products.toggleActive);
  const removeProduct = useMutation(api.products.remove);

  const formRef = React.useRef<ProductEditFormRef>(null);

  const [isEditing, setIsEditing] = React.useState(defaultEditMode);
  const [_isSaving, setIsSaving] = React.useState(false);
  const [isTogglingActive, setIsTogglingActive] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Sync edit state with defaultEditMode when sheet is opened
  React.useEffect(() => {
    if (isOpen) {
      setIsEditing(defaultEditMode);
    }
  }, [isOpen, defaultEditMode]);

  const handleToggleActive = async () => {
    if (!product) return;
    setIsTogglingActive(true);
    try {
      await toggleActive({ id: product._id });
      toast.success(
        product.isActive ? "Product deactivated" : "Product activated",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update product status");
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await removeProduct({ id: product._id });
      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
      onOpenChange(false); // Close the sheet
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const _handleSave = async () => {
    if (formRef.current) {
      setIsSaving(true);
      const success = await formRef.current.save();
      setIsSaving(false);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  if (productId && product === undefined) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl flex items-center justify-center">
          <SheetTitle className="sr-only">Loading Product Details</SheetTitle>
          <SheetDescription className="sr-only">Loading...</SheetDescription>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading product details...
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!product) return null;

  const formatDate = (ts: number) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(ts));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-xl overflow-y-auto"
        showCloseButton={false}
      >
        {/* Custom Close Button in top right */}
        <div className="absolute top-4 right-4 z-50">
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-neutral-450 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={16} />
            </Button>
          </SheetClose>
        </div>

        <SheetHeader className="space-y-4 px-4 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={product.isActive ? "default" : "destructive"}
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  product.isActive
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200/50 border border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
                <Calendar size={11} className="text-neutral-400" />
                <span>Launched {formatDate(product.launchedAt)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <SheetTitle className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                {isEditing ? "Edit Product Details" : product.name}
              </SheetTitle>

              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? null : (
                  <>
                    <Button
                      onClick={handleToggleActive}
                      disabled={isTogglingActive}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs gap-1 border-neutral-300 dark:border-neutral-700"
                    >
                      {isTogglingActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : product.isActive ? (
                        <>
                          Deactivate{" "}
                          <EyeOff className="h-3.5 w-3.5 text-neutral-500" />
                        </>
                      ) : (
                        <>
                          Activate{" "}
                          <Eye className="h-3.5 w-3.5 text-neutral-500" />
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsDeleteDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs gap-1 border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700"
                    >
                      Delete <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={handleStartEdit}
                      size="sm"
                      className="bg-[#ad8de9] hover:bg-[#ad8de9]/90 text-white gap-1 h-8 px-3 rounded-lg shadow-sm text-xs font-semibold"
                    >
                      Edit <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <SheetDescription className="sr-only">
                Edit the details of {product.name}
              </SheetDescription>
            ) : (
              <SheetDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal block pt-1 px-0.5">
                {product.description || (
                  <span className="italic text-neutral-400">
                    No description provided.
                  </span>
                )}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-5 px-4">
          {isEditing ? (
            <ProductEditForm
              ref={formRef}
              product={product}
              onSaveSuccess={() => setIsEditing(false)}
              onCancel={handleCancel}
            />
          ) : (
            <ProductViewDetails product={product} />
          )}
        </div>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
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
              <AlertDialogCancel className="rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
