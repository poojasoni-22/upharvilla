"use client";

import { useQuery } from "convex/react";
import {
  Boxes,
  IndianRupee,
  Layers,
  Package,
  Percent,
  Tag,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getPremiumColor } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";

const CATEGORIES_MAP: Record<string, string> = {
  "customized-gifts": "Customized Gifts",
  "corporate-gifts": "Corporate Gifts",
  hampers: "Hampers",
  "frames-bouquet": "Frames & Bouquet",
  "shop-by-occasion": "Shop by Occasion",
};

interface ProductViewDetailsProps {
  product: any;
}

export function ProductViewDetails({ product }: ProductViewDetailsProps) {
  const thumbnail = product?.thumbnail;
  const isDirectUrl = thumbnail?.startsWith("http");
  const imageUrl =
    useQuery(
      api.products.getImageUrl,
      thumbnail && !isDirectUrl ? { storageId: thumbnail } : "skip",
    ) || (isDirectUrl ? thumbnail : null);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(p);

  return (
    <div className="space-y-5 px-1 pb-24">
      {/* 1. Thumbnail / Main Image */}
      <div className="relative aspect-[16/10] sm:aspect-video rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-955 overflow-hidden flex items-center justify-center group shadow-xs transition-all duration-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <Package size={32} strokeWidth={1} />
            <span className="text-xs font-medium">No thumbnail provided</span>
          </div>
        )}
      </div>

      {product.images && product.images.length > 0 && (
        <>
          <Separator className="my-1" />

          {/* 2. Gallery / Extra Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product Gallery
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg border bg-neutral-50 dark:bg-neutral-955 overflow-hidden group shadow-xs"
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 3. Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/20 space-y-1 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
            <IndianRupee size={10} className="text-[#ad8de9]" /> Base Price
          </span>
          <p className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100 tabular-nums">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/20 space-y-1 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
            <Boxes size={10} className="text-blue-400" /> Stock Level
          </span>
          <p
            className={`text-lg font-bold font-mono tabular-nums ${
              product.stock === 0
                ? "text-red-500"
                : product.stock < 5
                  ? "text-amber-500"
                  : "text-neutral-800 dark:text-neutral-100"
            }`}
          >
            {product.stock}{" "}
            <span className="text-[10px] font-normal text-neutral-400">
              pcs
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/20 space-y-1 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
            <Percent size={10} className="text-emerald-400" /> Active Off
          </span>
          <p className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100 tabular-nums">
            {product.discount || 0}%
          </p>
        </div>
      </div>

      {/* 4. Categorization & Tags (Details Card) */}
      <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
          Categorization & Tags
        </h4>
        <div className="border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/50">
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              {/* Row 1: Category & Subcategory */}
              <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[15%] border-r border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                    <Layers size={10} /> Category
                  </div>
                </td>
                <td className="p-3 text-neutral-700 dark:text-neutral-200 font-semibold w-[35%] border-r border-neutral-100 dark:border-neutral-800/60">
                  {CATEGORIES_MAP[product.category] || product.category}
                </td>
                <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[15%] border-r border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                    <Layers size={10} /> Subcategory
                  </div>
                </td>
                <td className="p-3 text-neutral-700 dark:text-neutral-200 font-semibold w-[35%]">
                  {product.subCategory || (
                    <span className="text-neutral-400 italic font-normal">
                      None
                    </span>
                  )}
                </td>
              </tr>

              {/* Row 2: Target Recipients */}
              <tr className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[15%] border-r border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                    <Users size={10} /> Recipients
                  </div>
                </td>
                <td colSpan={3} className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {product.recipients && product.recipients.length > 0 ? (
                      product.recipients.map((recipient: string) => (
                        <Badge
                          key={recipient}
                          variant="outline"
                          className="bg-[#ad8de9]/5 text-[#ad8de9] border-[#ad8de9]/20 text-[10px] px-2 py-0.5 rounded-md font-medium"
                        >
                          {recipient}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-400 italic">
                        None specified
                      </span>
                    )}
                  </div>
                </td>
              </tr>

              {/* Row 3: Search Tags */}
              <tr>
                <td className="p-3 bg-neutral-50/50 dark:bg-neutral-900/30 w-[15%] border-r border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-400 dark:text-neutral-500 uppercase text-[9px] tracking-wider">
                    <Tag size={10} /> Search Tags
                  </div>
                </td>
                <td colSpan={3} className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {product.tags && product.tags.length > 0 ? (
                      product.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-[10px] px-2 py-0.5 border-neutral-200/80 dark:border-neutral-800 rounded-md font-medium"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-400 italic">
                        No tags added
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Merchandising Badges */}
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
            <Switch checked={product.markNewArrival} disabled />
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
            <Switch checked={product.markTrending} disabled />
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
            <Switch checked={product.markMostPurchased} disabled />
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
            <Switch checked={product.markMostSold} disabled />
          </div>
        </div>
      </div>

      {/* 6. Variants */}
      <div className="space-y-3 bg-neutral-50/30 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">
          Product Variants
        </h4>
        {product.variants &&
        ((product.variants.sizes && product.variants.sizes.length > 0) ||
          (product.variants.colors && product.variants.colors.length > 0)) ? (
          <div className="space-y-3">
            {product.variants.sizes && product.variants.sizes.length > 0 && (
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl p-3 shadow-xs">
                <div className="w-16 shrink-0 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Sizes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.sizes.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs border bg-neutral-50 dark:bg-neutral-950 font-semibold text-neutral-700 dark:text-neutral-300 min-w-8 text-center"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.variants.colors && product.variants.colors.length > 0 && (
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl p-3 shadow-xs">
                <div className="w-16 shrink-0 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Colors
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.colors.map((c: string) => (
                    <div
                      key={c}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-neutral-50 dark:bg-neutral-950 font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      <div
                        className="w-2 h-2 rounded-full border border-black/10"
                        style={{ backgroundColor: getPremiumColor(c) }}
                      />
                      <span className="capitalize">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-neutral-400 italic bg-white dark:bg-neutral-900/50 p-2.5 rounded-lg border border-dashed flex items-center justify-center">
            No variants configured.
          </div>
        )}
      </div>
    </div>
  );
}
