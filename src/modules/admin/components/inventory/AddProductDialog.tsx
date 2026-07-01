"use client";

import {
  Add01Icon,
  Cancel01Icon,
  ImageUploadIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { upload } from "@imagekit/next";
import { useMutation, useQuery } from "convex/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { compressThumbnail } from "@/lib/image-compress";
import { prewarmImageKitCache } from "@/lib/imagekit-url";
import { getPremiumColor } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";

// Tag presets matching the navigation mega-menu structure
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
  "New Arrivals": [
    "Viral & Bestselling Gifts",
    "Instagram-Worthy Gifts",
    "Spotify Gifts",
    "Seasonal Trending Gifts",
    "Mini Budget Gifts",
  ],
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

type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<CategoryValue | "">("");
  const [subCategory, setSubCategory] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [stock, setStock] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  // Additional settings
  const [markNewArrival, setMarkNewArrival] = useState(false);
  const [markTrending, setMarkTrending] = useState(false);
  const [markMostPurchased, setMarkMostPurchased] = useState(false);
  const [markMostSold, setMarkMostSold] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  // ── Dynamic occasion subcategories from DB ──
  const activeOccasions = useQuery(api.occasions.getOccasions);

  const authenticator = async () => {
    const response = await fetch("/api/imagekit/auth");
    if (!response.ok) throw new Error("Auth failed");
    return await response.json();
  };

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setSubCategory("");
    setSelectedRecipients([]);
    setTags([]);
    setTagInput("");
    setStock("");
    setThumbnailPreview(null);
    setMarkNewArrival(false);
    setMarkTrending(false);
    setMarkMostPurchased(false);
    setMarkMostSold(false);
    setSizes([]);
    setColors([]);
    setSizeInput("");
    setColorInput("");
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      }
      if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
        setTags((prev) => prev.slice(0, -1));
      }
    },
    [handleAddTag, tagInput, tags.length],
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error("Product name is required");
        return;
      }
      if (!price || Number(price) <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      if (!category) {
        toast.error("Please select a category");
        return;
      }
      if (!subCategory) {
        toast.error("Please select a subcategory");
        return;
      }
      if (tags.length < 2) {
        toast.error("Add at least 2 tags");
        return;
      }

      setLoading(true);
      const currentName = name.trim();
      const currentThumbnailFile = thumbnailFile;

      try {
        // 1. Create product immediately with no thumbnail
        const productId = await createProduct({
          name: currentName,
          description: description.trim(),
          price: Number(price),
          thumbnail: "", // Temporary empty thumbnail
          category: category as CategoryValue,
          subCategory: subCategory || undefined,
          recipients:
            selectedRecipients.length > 0 ? selectedRecipients : undefined,
          tags,
          stock: Number(stock) || 0,
          markNewArrival,
          markTrending,
          markMostPurchased,
          markMostSold,
          variants: {
            sizes: sizes.length > 0 ? sizes : undefined,
            colors: colors.length > 0 ? colors : undefined,
          },
        });

        // 2. Success UI feedback immediately
        toast.success("Product created! Uploading thumbnail...");
        resetForm();
        setOpen(false);

        // 3. Background Upload
        if (currentThumbnailFile) {
          // We fire and forget this async operation
          (async () => {
            try {
              const authParams = await authenticator();
              const compressedFile =
                await compressThumbnail(currentThumbnailFile);
              const uploadResponse = await upload({
                file: compressedFile,
                fileName: `thumb_${Date.now()}`,
                folder: "/products/thumbnails",
                ...authParams,
              });
              const thumbnailImageUrl = uploadResponse.url;

              // Pre-warm optimized variations in the background
              prewarmImageKitCache(thumbnailImageUrl);

              // Update product with actual thumbnail
              await updateProduct({
                id: productId,
                thumbnail: thumbnailImageUrl,
              });
              toast.success(`Thumbnail for "${currentName}" uploaded!`);
            } catch (error) {
              console.error("Background upload error:", error);
              toast.error(`Thumbnail upload failed for "${currentName}".`);
            }
          })();
        }
      } catch (error) {
        console.error("Product creation error:", error);
        toast.error("Failed to create product. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      name,
      description,
      price,
      category,
      subCategory,
      selectedRecipients,
      tags,
      stock,
      thumbnailFile,
      markNewArrival,
      markTrending,
      markMostPurchased,
      markMostSold,
      sizes,
      colors,
      createProduct,
      updateProduct,
      resetForm,
      authenticator,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-product-btn" size="lg">
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-sidebar border border-neutral-300 dark:border-neutral-700 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-neutral-800 font-serif">
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Fill in the details below to add a new product to your inventory.
          </DialogDescription>
          <Separator
            className="-mx-4 mt-2 bg-neutral-300 dark:bg-neutral-700"
            style={{ width: "calc(100% + 32px)" }}
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {/* Product Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="product-name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              placeholder="e.g. Premium Gift Hamper"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="bg-card"
            />
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              placeholder="Describe this product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="min-h-20 bg-card"
            />
          </div>

          {/* Price & Stock – side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="product-price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                className="bg-card px-2"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={loading}
                className="bg-card px-2"
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="grid gap-1.5">
            <Label className="flex items-center justify-between w-full">
              <span>Thumbnail</span>
              <span className="text-[10px] text-muted-foreground font-normal lowercase normal-case">
                Recommended: 600 × 800 px (3:4 ratio)
              </span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {thumbnailPreview ? (
              <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-border">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                disabled={loading}
              >
                <HugeiconsIcon
                  icon={ImageUploadIcon}
                  size={24}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to upload thumbnail
                </span>
              </button>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <Label htmlFor="product-category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val as CategoryValue);
                setSubCategory(""); // Reset subcategory when category changes
              }}
              disabled={loading}
            >
              <SelectTrigger id="product-category" className="w-full bg-card">
                <SelectValue placeholder="Select a category" />
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
            <Label htmlFor="product-subcategory">
              Subcategory <span className="text-destructive">*</span>
            </Label>
            <Select
              value={subCategory}
              onValueChange={setSubCategory}
              disabled={loading || !category}
            >
              <SelectTrigger
                id="product-subcategory"
                className="w-full bg-card"
              >
                <SelectValue
                  placeholder={
                    category
                      ? "Select a subcategory"
                      : "Select a category first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {category &&
                  CATEGORY_TO_PRESET_KEY[category] &&
                  (category === "shop-by-occasion" && activeOccasions
                    ? activeOccasions.map((occ) => (
                        <SelectItem key={occ.slug} value={occ.label}>
                          {occ.label}
                        </SelectItem>
                      ))
                    : TAG_PRESETS[CATEGORY_TO_PRESET_KEY[category]].map(
                        (sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ),
                      ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient / Relationship */}
          <div className="grid gap-1.5">
            <Label>Recipient / Relationship</Label>
            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar scrollbar-none pb-0.5">
              {RECIPIENT_OPTIONS.map((recipient) => {
                const isSelected = selectedRecipients.includes(recipient);
                return (
                  <button
                    key={recipient}
                    type="button"
                    onClick={() => {
                      setSelectedRecipients((prev) =>
                        prev.includes(recipient)
                          ? prev.filter((r) => r !== recipient)
                          : [...prev, recipient],
                      );
                    }}
                    disabled={loading}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#ad8de9]/15 text-[#ad8de9] border-[#ad8de9]/30 font-semibold"
                        : "bg-card text-muted-foreground border-border hover:border-[#ad8de9]/20 hover:text-foreground"
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
            <Label>
              Tags <span className="text-muted-foreground">(min 2)</span>
            </Label>
            <div className="flex flex-wrap items-center gap-1.5 min-h-9 rounded-md border border-input bg-card px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition-colors">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-0.5 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={10}
                      strokeWidth={2.5}
                    />
                  </button>
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
                className="flex-1 min-w-20 bg-transparent outline-none text-xs placeholder:text-muted-foreground"
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Press Enter to add a tag. Backspace to remove the last one.
            </p>
          </div>

          <Separator
            className="-mx-4 my-2 bg-neutral-300 dark:bg-neutral-700"
            style={{ width: "calc(100% + 32px)" }}
          />

          {/* Product Variants (Sizes & Colors) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sizes */}
            <div className="grid gap-1.5">
              <Label>Sizes</Label>
              <div className="flex flex-wrap items-center gap-1.5 min-h-9 rounded-md border border-input bg-card px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition-colors">
                {sizes.map((size) => (
                  <Badge
                    key={size}
                    variant="secondary"
                    className="gap-0.5 pr-1"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() =>
                        setSizes((prev) => prev.filter((s) => s !== size))
                      }
                      disabled={loading}
                      className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={10}
                        strokeWidth={2.5}
                      />
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
                      if (trimmed && !sizes.includes(trimmed)) {
                        setSizes((prev) => [...prev, trimmed]);
                        setSizeInput("");
                      }
                    }
                  }}
                  placeholder={sizes.length === 0 ? "e.g. S, M, L..." : ""}
                  className="flex-1 min-w-12 bg-transparent outline-none text-xs placeholder:text-muted-foreground"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid gap-1.5">
              <Label>Colors</Label>
              <div className="flex flex-wrap items-center gap-1.5 min-h-9 rounded-md border border-input bg-card px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition-colors">
                {colors.map((color) => (
                  <Badge
                    key={color}
                    variant="secondary"
                    className="gap-0.5 pr-1 flex items-center"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full border border-black/10 shrink-0 mr-1"
                      style={{ backgroundColor: getPremiumColor(color) }}
                    />
                    {color}
                    <button
                      type="button"
                      onClick={() =>
                        setColors((prev) => prev.filter((c) => c !== color))
                      }
                      disabled={loading}
                      className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={10}
                        strokeWidth={2.5}
                      />
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
                      if (trimmed && !colors.includes(trimmed)) {
                        setColors((prev) => [...prev, trimmed]);
                        setColorInput("");
                      }
                    }
                  }}
                  placeholder={colors.length === 0 ? "e.g. Red, Blue..." : ""}
                  className="flex-1 min-w-12 bg-transparent outline-none text-xs placeholder:text-muted-foreground"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Separator
            className="-mx-4 my-2 bg-neutral-300 dark:bg-neutral-700"
            style={{ width: "calc(100% + 32px)" }}
          />

          {/* Additional Settings */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Additional Settings / Badge Listing
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* New Arrival Toggle */}
              <div className="flex flex-col items-center justify-between p-2.5 rounded-xl border bg-card/50 text-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  New Arrival
                </span>
                <Switch
                  checked={markNewArrival}
                  onCheckedChange={setMarkNewArrival}
                  disabled={loading}
                />
              </div>

              {/* Trending Toggle */}
              <div className="flex flex-col items-center justify-between p-2.5 rounded-xl border bg-card/50 text-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Trending Item
                </span>
                <Switch
                  checked={markTrending}
                  onCheckedChange={setMarkTrending}
                  disabled={loading}
                />
              </div>

              {/* Most Purchased Toggle */}
              <div className="flex flex-col items-center justify-between p-2.5 rounded-xl border bg-card/50 text-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Most Purchased
                </span>
                <Switch
                  checked={markMostPurchased}
                  onCheckedChange={setMarkMostPurchased}
                  disabled={loading}
                />
              </div>

              {/* Most Sold Toggle */}
              <div className="flex flex-col items-center justify-between p-2.5 rounded-xl border bg-card/50 text-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Most Sold
                </span>
                <Switch
                  checked={markMostSold}
                  onCheckedChange={setMarkMostSold}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Separator
            className="-mx-4 my-2 bg-neutral-300 dark:bg-neutral-700"
            style={{ width: "calc(100% + 32px)" }}
          />

          {/* Footer */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={14}
                    className="animate-spin"
                    data-icon="inline-start"
                  />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
