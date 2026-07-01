"use client";

import { upload } from "@imagekit/next";
import { useMutation, useQuery } from "convex/react";
import {
  ImagePlus,
  Layers,
  Loader2,
  Package,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { compressGalleryImage, compressThumbnail } from "@/lib/image-compress";
import { prewarmImageKitCache } from "@/lib/imagekit-url";
import { getPremiumColor } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";

const TAG_PRESETS: Record<string, string[]> = {
  "Customized Gifts": [
    "Customized Photo Gifts",
    "Customized Couple Gifts",
    "Customized Jewelry",
    "Customized Fashion Gifts",
    "Customized Home Decor",
    "Customized Drinkware",
    "Customized Kids Gifts",
  ],
  "Corporate Gifts": [
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
  Hampers: [
    "Birthday Hampers",
    "Wedding Hampers",
    "Couple Hampers",
    "Festive Hampers",
    "Corporate Hampers",
    "Luxury Hampers",
    "Baby & Kids Hampers",
    "Customized Hampers",
  ],
  "Frames & Bouquet": [
    "Photo Frames",
    "LED Frames",
    "Acrylic Frames",
    "Fresh Flower Bouquet",
    "Artificial Bouquet",
    "Frame + Bouquet Combo",
  ],
  "Shop by Occasion": [] as string[], // ← populated dynamically from active occasions DB
};

const CATEGORIES = [
  { value: "customized-gifts", label: "Customized Gifts" },
  { value: "corporate-gifts", label: "Corporate Gifts" },
  { value: "hampers", label: "Hampers" },
  { value: "frames-bouquet", label: "Frames & Bouquet" },
  { value: "shop-by-occasion", label: "Shop by Occasion" },
] as const;

const CATEGORY_TO_PRESET_KEY: Record<string, string> = {
  "customized-gifts": "Customized Gifts",
  "corporate-gifts": "Corporate Gifts",
  hampers: "Hampers",
  "frames-bouquet": "Frames & Bouquet",
  "shop-by-occasion": "Shop by Occasion",
};

const RECIPIENT_OPTIONS = [
  "Him",
  "Her",
  "Kids",
  "Friend",
  "Girlfriend",
  "Boyfriend",
  "Wife",
  "Husband",
];

export interface ProductEditFormRef {
  save: () => Promise<boolean>;
}

interface ProductEditFormProps {
  product: any;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const ProductEditForm = forwardRef<
  ProductEditFormRef,
  ProductEditFormProps
>(({ product, onSaveSuccess, onCancel }, ref) => {
  const updateProduct = useMutation(api.products.update);

  // ── Dynamic occasion subcategories from DB ──
  const activeOccasions = useQuery(api.occasions.getOccasions);

  const [editName, setEditName] = useState(product.name);
  const [editDescription, setEditDescription] = useState(
    product.description || "",
  );
  const [editPrice, setEditPrice] = useState(product.price.toString());
  const [editStock, setEditStock] = useState(product.stock.toString());
  const [editDiscount, setEditDiscount] = useState(
    product.discount?.toString() || "",
  );
  const [editCategory, setEditCategory] = useState(product.category);
  const [editSubCategory, setEditSubCategory] = useState(
    product.subCategory || "",
  );
  const [editRecipients, setEditRecipients] = useState<string[]>(
    product.recipients || [],
  );
  const [editTags, setEditTags] = useState<string[]>(product.tags || []);
  const [editTagInput, setEditTagInput] = useState("");
  const [editSizes, setEditSizes] = useState<string[]>(
    product.variants?.sizes || [],
  );
  const [editColors, setEditColors] = useState<string[]>(
    product.variants?.colors || [],
  );
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  const [editMarkNewArrival, setEditMarkNewArrival] = useState(
    !!product.markNewArrival,
  );
  const [editMarkTrending, setEditMarkTrending] = useState(
    !!product.markTrending,
  );
  const [editMarkMostPurchased, setEditMarkMostPurchased] = useState(
    !!product.markMostPurchased,
  );
  const [editMarkMostSold, setEditMarkMostSold] = useState(
    !!product.markMostSold,
  );

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const thumbnail = product?.thumbnail;
  const isDirectUrl = thumbnail?.startsWith("http");
  const imageUrl =
    useQuery(
      api.products.getImageUrl,
      thumbnail && !isDirectUrl ? { storageId: thumbnail } : "skip",
    ) || (isDirectUrl ? thumbnail : null);

  const authenticator = async () => {
    const response = await fetch("/api/imagekit/auth");
    if (!response.ok) throw new Error("Auth failed");
    return await response.json();
  };

  const handleUpdateThumbnail = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    const uploadPromise = async () => {
      setIsThumbnailUploading(true);
      try {
        const authParams = await authenticator();
        const compressedFile = await compressThumbnail(file);
        const uploadResponse = await upload({
          file: compressedFile,
          fileName: `product_thumbnail_${Date.now()}`,
          folder: "/products/thumbnails",
          ...authParams,
        });

        if (uploadResponse.url) {
          prewarmImageKitCache(uploadResponse.url);
          await updateProduct({
            id: product._id,
            thumbnail: uploadResponse.url,
          });
          return "Thumbnail updated";
        }
        throw new Error("Upload failed");
      } finally {
        setIsThumbnailUploading(false);
        if (e.target) e.target.value = "";
      }
    };

    toast.promise(uploadPromise(), {
      loading: "Updating thumbnail...",
      success: (data) => data,
      error: "Failed to update thumbnail",
    });
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    const uploadPromise = async () => {
      setIsGalleryUploading(true);
      try {
        const authParams = await authenticator();
        const compressedFile = await compressGalleryImage(file);
        const uploadResponse = await upload({
          file: compressedFile,
          fileName: `product_gallery_${Date.now()}`,
          folder: "/products/gallery",
          ...authParams,
        });

        if (uploadResponse.url) {
          prewarmImageKitCache(uploadResponse.url);
          const currentImages = product.images || [];
          await updateProduct({
            id: product._id,
            images: [...currentImages, uploadResponse.url],
          });
          return "Gallery image added";
        }
        throw new Error("Upload failed");
      } finally {
        setIsGalleryUploading(false);
        if (e.target) e.target.value = "";
      }
    };

    toast.promise(uploadPromise(), {
      loading: "Uploading gallery image...",
      success: (data) => data,
      error: "Failed to upload image",
    });
  };

  const handleSave = async (): Promise<boolean> => {
    if (!product) return false;
    if (!editName.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!editPrice || Number(editPrice) <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }
    if (!editCategory) {
      toast.error("Please select a category");
      return false;
    }
    if (!editSubCategory) {
      toast.error("Please select a subcategory");
      return false;
    }
    if (editTags.length < 2) {
      toast.error("Add at least 2 tags");
      return false;
    }

    try {
      await updateProduct({
        id: product._id,
        name: editName.trim(),
        description: editDescription.trim(),
        price: Number(editPrice),
        stock: Number(editStock) || 0,
        discount: editDiscount ? Number(editDiscount) : 0,
        category: editCategory as any,
        subCategory: editSubCategory,
        recipients: editRecipients.length > 0 ? editRecipients : undefined,
        tags: editTags,
        variants: {
          sizes: editSizes.length > 0 ? editSizes : undefined,
          colors: editColors.length > 0 ? editColors : undefined,
        },
        markNewArrival: editMarkNewArrival,
        markTrending: editMarkTrending,
        markMostPurchased: editMarkMostPurchased,
        markMostSold: editMarkMostSold,
      });
      toast.success("Product updated successfully");
      onSaveSuccess();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
      return false;
    }
  };

  const handleLocalSave = async () => {
    setIsSaving(true);
    await handleSave();
    setIsSaving(false);
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }));

  return (
    <div className="grid gap-4 py-2 px-1 animate-in fade-in duration-200">
      {/* 1. Thumbnail Section */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Thumbnail</span>
          <span className="text-[10px] text-muted-foreground font-normal lowercase normal-case">
            Recommended: 600 × 800 px (3:4 ratio)
          </span>
        </Label>
        <div className="relative aspect-[16/10] sm:aspect-video rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-955 overflow-hidden flex items-center justify-center group shadow-xs transition-all duration-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={editName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <Package size={32} strokeWidth={1} />
              <span className="text-xs font-medium">No thumbnail provided</span>
            </div>
          )}

          {isThumbnailUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 size={24} className="animate-spin text-[#ad8de9]" />
            </div>
          )}

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <input
              type="file"
              ref={thumbnailInputRef}
              className="hidden"
              onChange={handleUpdateThumbnail}
              accept="image/*"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 text-xs gap-1.5 bg-white/95 dark:bg-neutral-900/95 shadow-md hover:bg-white dark:hover:bg-neutral-900 border text-neutral-700 dark:text-neutral-300 backdrop-blur-xs font-medium rounded-lg"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isThumbnailUploading}
            >
              <ImagePlus size={13} className="text-[#ad8de9]" /> Change
              Thumbnail
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-1" />

      {/* 2. Gallery / Extra Images Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between w-full pr-4">
            <span>Product Gallery</span>
            <span className="text-[10px] text-muted-foreground font-normal lowercase normal-case">
              Recommended: 900 × 1200 px (3:4 ratio)
            </span>
          </Label>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAddImage}
            accept="image/*"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 border bg-[#ad8de9] hover:bg-[#ad8de9]/90 text-white font-medium px-2.5 rounded-lg shadow-sm shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGalleryUploading}
          >
            <ImagePlus size={12} /> Add Image
          </Button>
        </div>

        {((product.images && product.images.length > 0) ||
          isGalleryUploading) && (
          <div className="grid grid-cols-3 gap-3">
            {product.images?.map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg border bg-neutral-50 dark:bg-neutral-955 overflow-hidden group shadow-xs"
              >
                <img
                  src={img}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-355 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 rounded-md cursor-pointer"
                    onClick={async () => {
                      const newImages = product?.images?.filter(
                        (_: any, i: number) => i !== idx,
                      );
                      await updateProduct({
                        id: product?._id,
                        images: newImages,
                      });
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}

            {/* Uploading Placeholder */}
            {isGalleryUploading && (
              <div className="relative aspect-square rounded-lg border border-dashed border-[#ad8de9] bg-[#ad8de9]/5 overflow-hidden flex items-center justify-center animate-pulse">
                <Loader2 size={16} className="animate-spin text-[#ad8de9]" />
              </div>
            )}
          </div>
        )}
      </div>

      <Separator className="my-1" />

      {/* 3. Product Name */}
      <div className="grid gap-1.5">
        <Label
          htmlFor="edit-name"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Product Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="bg-card border-neutral-300 focus-visible:ring-[#ad8de9] rounded-lg h-9"
          placeholder="e.g. Premium Gift Hamper"
        />
      </div>

      {/* Description */}
      <div className="grid gap-1.5">
        <Label
          htmlFor="edit-description"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Description
        </Label>
        <Textarea
          id="edit-description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="min-h-24 bg-card border-neutral-300 focus-visible:ring-[#ad8de9] text-sm leading-relaxed rounded-lg"
          placeholder="Product description..."
        />
      </div>

      {/* Price & Stock - side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label
            htmlFor="edit-price"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Price (₹) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
              ₹
            </span>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="pl-7 bg-card border-neutral-300 focus-visible:ring-[#ad8de9] text-sm font-mono rounded-lg h-9"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label
            htmlFor="edit-stock"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Stock
          </Label>
          <Input
            id="edit-stock"
            type="number"
            min="0"
            value={editStock}
            onChange={(e) => setEditStock(e.target.value)}
            className="bg-card border-neutral-300 focus-visible:ring-[#ad8de9] text-sm font-mono rounded-lg h-9"
          />
        </div>
      </div>

      {/* Discount - stacked */}
      <div className="grid gap-1.5">
        <Label
          htmlFor="edit-discount"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Discount (%)
        </Label>
        <div className="relative">
          <Input
            id="edit-discount"
            type="number"
            min="0"
            max="99"
            value={editDiscount}
            onChange={(e) => setEditDiscount(e.target.value)}
            className="bg-card border-neutral-300 focus-visible:ring-[#ad8de9] text-sm font-mono pr-7 rounded-lg h-9"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
            %
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers size={12} className="text-neutral-400" /> Category{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={editCategory}
          onValueChange={(val) => {
            setEditCategory(val);
            setEditSubCategory(""); // Reset subcategory when category changes
          }}
        >
          <SelectTrigger className="bg-card border-neutral-300 focus-visible:ring-[#ad8de9] rounded-lg h-9 text-xs">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers size={12} className="text-neutral-400" /> Subcategory{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={editSubCategory}
          onValueChange={setEditSubCategory}
          disabled={!editCategory}
        >
          <SelectTrigger className="bg-card border-neutral-300 focus-visible:ring-[#ad8de9] rounded-lg h-9 text-xs">
            <SelectValue
              placeholder={
                editCategory ? "Select subcategory" : "Category first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {editCategory &&
              CATEGORY_TO_PRESET_KEY[editCategory] &&
              (editCategory === "shop-by-occasion" && activeOccasions
                ? activeOccasions.map((occ) => (
                    <SelectItem key={occ.slug} value={occ.label}>
                      {occ.label}
                    </SelectItem>
                  ))
                : TAG_PRESETS[CATEGORY_TO_PRESET_KEY[editCategory]].map(
                    (sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ),
                  ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recipients */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Users size={12} className="text-neutral-400" /> Recipients
        </Label>
        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar scrollbar-none pb-0.5">
          {RECIPIENT_OPTIONS.map((recipient) => {
            const isSelected = editRecipients.includes(recipient);
            return (
              <button
                key={recipient}
                type="button"
                onClick={() => {
                  setEditRecipients((prev) =>
                    prev.includes(recipient)
                      ? prev.filter((r) => r !== recipient)
                      : [...prev, recipient],
                  );
                }}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#ad8de9]/15 text-[#ad8de9] border-[#ad8de9]/30 font-semibold shadow-xs"
                    : "bg-card text-muted-foreground border-neutral-200 hover:border-[#ad8de9]/20 hover:text-foreground"
                }`}
              >
                {recipient}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Tag size={12} className="text-neutral-400" /> Tags{" "}
          <span className="text-muted-foreground text-[10px] lowercase">
            (min 2)
          </span>
        </Label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 bg-card p-2 focus-within:border-[#ad8de9] focus-within:ring-1 focus-within:ring-[#ad8de9] transition-all max-w-full">
          {editTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-[11px] h-6 py-0 flex items-center bg-[#ad8de9]/10 text-neutral-800 border-none rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() =>
                  setEditTags((prev) => prev.filter((t) => t !== tag))
                }
                className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
          <input
            value={editTagInput}
            onChange={(e) => setEditTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = editTagInput.trim();
                if (trimmed && !editTags.includes(trimmed)) {
                  setEditTags((prev) => [...prev, trimmed]);
                  setEditTagInput("");
                }
              }
            }}
            placeholder={editTags.length === 0 ? "Type and press Enter..." : ""}
            className="flex-1 min-w-16 bg-transparent outline-none text-xs placeholder:text-muted-foreground h-5"
          />
        </div>
      </div>

      {/* Product Variants (Sizes & Colors) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sizes */}
        <div className="grid gap-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Sizes
          </Label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 bg-card p-2 focus-within:border-[#ad8de9] focus-within:ring-1 focus-within:ring-[#ad8de9] transition-all max-w-full min-h-9">
            {editSizes.map((size) => (
              <Badge
                key={size}
                variant="secondary"
                className="gap-1 pr-1 text-[11px] h-6 py-0 flex items-center bg-[#ad8de9]/10 text-neutral-800 border-none rounded-md"
              >
                {size}
                <button
                  type="button"
                  onClick={() =>
                    setEditSizes((prev) => prev.filter((s) => s !== size))
                  }
                  className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = sizeInput.trim().toUpperCase();
                  if (trimmed && !editSizes.includes(trimmed)) {
                    setEditSizes((prev) => [...prev, trimmed]);
                    setSizeInput("");
                  }
                }
              }}
              placeholder={editSizes.length === 0 ? "e.g. S, M, L..." : ""}
              className="flex-1 min-w-12 bg-transparent outline-none text-xs placeholder:text-muted-foreground h-5"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="grid gap-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Colors
          </Label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 bg-card p-2 focus-within:border-[#ad8de9] focus-within:ring-1 focus-within:ring-[#ad8de9] transition-all max-w-full min-h-9">
            {editColors.map((color) => (
              <Badge
                key={color}
                variant="secondary"
                className="gap-1 pr-1 text-[11px] h-6 py-0 flex items-center bg-[#ad8de9]/10 text-neutral-800 border-none rounded-md"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: getPremiumColor(color) }}
                />
                {color}
                <button
                  type="button"
                  onClick={() =>
                    setEditColors((prev) => prev.filter((c) => c !== color))
                  }
                  className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            <input
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = colorInput.trim();
                  if (trimmed && !editColors.includes(trimmed)) {
                    setEditColors((prev) => [...prev, trimmed]);
                    setColorInput("");
                  }
                }
              }}
              placeholder={editColors.length === 0 ? "e.g. Red, Blue..." : ""}
              className="flex-1 min-w-12 bg-transparent outline-none text-xs placeholder:text-muted-foreground h-5"
            />
          </div>
        </div>
      </div>

      <Separator className="my-1" />

      {/* Merchandising Switches */}
      <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
          Merchandising Toggles
        </h4>
        <div className="grid gap-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  New Arrival
                </span>
                <span className="text-[9px] text-neutral-400">
                  Showcase in latest arrivals
                </span>
              </div>
            </div>
            <Switch
              checked={editMarkNewArrival}
              onCheckedChange={setEditMarkNewArrival}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  Trending Item
                </span>
                <span className="text-[9px] text-neutral-400">
                  Showcase in trending list
                </span>
              </div>
            </div>
            <Switch
              checked={editMarkTrending}
              onCheckedChange={setEditMarkTrending}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  Most Purchased
                </span>
                <span className="text-[9px] text-neutral-400">
                  Showcase in top sellers
                </span>
              </div>
            </div>
            <Switch
              checked={editMarkMostPurchased}
              onCheckedChange={setEditMarkMostPurchased}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  Most Sold
                </span>
                <span className="text-[9px] text-neutral-400">
                  Showcase in top sellers list
                </span>
              </div>
            </div>
            <Switch
              checked={editMarkMostSold}
              onCheckedChange={setEditMarkMostSold}
            />
          </div>
        </div>
      </div>

      <Separator className="my-2 bg-neutral-200 dark:bg-neutral-800" />

      {/* Action Buttons with padding below */}
      <div className="flex items-center justify-end gap-3 pt-3 pb-20">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="h-9 px-4 rounded-xl text-xs font-semibold border-neutral-300 dark:border-neutral-700"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleLocalSave}
          disabled={isSaving}
          className="bg-[#ad8de9] hover:bg-[#ad8de9]/90 text-white gap-1.5 h-9 px-5 rounded-xl shadow-md text-xs font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
});

ProductEditForm.displayName = "ProductEditForm";
