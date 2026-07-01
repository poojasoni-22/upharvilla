"use client";

import { Rating } from "@mui/material";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { thumbnailUrl } from "@/lib/imagekit-url";
import { cn } from "@/lib/utils";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: any;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const images = useMemo(
    () =>
      [product.thumbnail, ...(product.images || [])]
        .filter(Boolean)
        .map((src: string) => thumbnailUrl(src)),
    [product.thumbnail, product.images],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isHovered && images.length > 1) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex(1);
        if (images.length > 2) {
          intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
          }, 900);
        }
      }, 400);
    } else {
      setCurrentIndex(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images]);

  const originalPrice = product.discount
    ? Math.round(product.price / (1 - product.discount / 100))
    : null;

  // Simulated review count (can be replaced with real data later)
  const reviewCount = Math.floor(10 + (product.price % 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("group relative flex flex-col cursor-pointer", className)}
    >
      <Link
        href={`/product/${product._id}`}
        className="flex flex-col h-full w-full"
      >
        {/* Image Container — full bleed, clean */}
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl bg-[#F7F7F7]",
            product.stock <= 0 && "opacity-80",
          )}
        >
          {/* Sliding strip */}
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
            }}
          >
            {images.map((src: string, i: number) => (
              <div
                key={i}
                className="relative h-full flex-none"
                style={{ width: `${100 / images.length}%` }}
              >
                <Image
                  src={
                    src ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Badge overlays at the top-left of the image container (Flipkart/Nykaa style) */}
          {(product.stock <= 0 ||
            product.markMostPurchased === true ||
            product.markMostSold === true ||
            product.markTrending === true ||
            !!(
              product.markNewArrival ||
              (product.launchedAt &&
                Date.now() - product.launchedAt < 24 * 60 * 60 * 1000)
            )) && (
            <div className="absolute top-1.5 md:top-2.5 left-0 z-10 flex flex-col items-start">
              {product.stock <= 0 ? (
                <span className="bg-[#FAFAFA]/95 backdrop-blur-xs text-[#737373] border-y border-r border-[#E5E5E5] text-[8px] font-sans font-bold tracking-wider px-2.5 py-0.5 rounded-r-md shadow-sm uppercase">
                  Sold Out
                </span>
              ) : product.markMostSold === true ||
                product.markMostPurchased === true ? (
                <span className="bg-[#E2AF3E] text-white text-[8px] font-sans font-extrabold tracking-wider px-2.5 py-0.5 rounded-r-md shadow-sm uppercase">
                  Most Sold
                </span>
              ) : product.markTrending === true ? (
                <span className="bg-[#FC2779] text-white text-[8px] font-sans font-extrabold tracking-wider px-2.5 py-0.5 rounded-r-md shadow-sm uppercase">
                  Trending
                </span>
              ) : (
                <span className="bg-[#0D9488] text-white text-[8px] font-sans font-extrabold tracking-wider px-2.5 py-0.5 rounded-r-md shadow-sm uppercase">
                  New Arrival
                </span>
              )}
            </div>
          )}
        </div>

        {/* Text content — @container makes text scale with card width */}
        <div className="@container pt-2 px-0.5 flex flex-col gap-1">
          {/* Product name */}
          <h3
            className="text-[11px] @[120px]:text-xs @[160px]:text-sm @[220px]:text-base text-gray-800 capitalize truncate leading-snug font-medium"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Stars + review count */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Rating
              name={`rating-${product._id}`}
              defaultValue={2.5}
              precision={0.5}
              readOnly
              size="small"
              sx={{ fontSize: "0.7rem" }}
            />
            <span className="text-[9px] @[140px]:text-[10px] @[200px]:text-xs text-gray-400 font-medium whitespace-nowrap">
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between gap-1.5 mt-0">
            <div className="flex items-baseline gap-0.5 @[140px]:gap-1 min-w-0 overflow-hidden">
              <span className="text-xs @[120px]:text-sm @[180px]:text-base @[240px]:text-lg font-bold text-gray-900 font-mono whitespace-nowrap">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <>
                  <span className="text-[8px] @[140px]:text-[9px] @[180px]:text-[11px] @[240px]:text-xs text-gray-400 line-through font-mono whitespace-nowrap">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[8px] @[140px]:text-[9px] @[180px]:text-[11px] font-bold text-[#E11D48] font-sans whitespace-nowrap">
                    {product.discount}%
                  </span>
                </>
              )}
            </div>
            <span
              className={`flex items-center gap-0.5 text-[9px] @[140px]:text-[10px] @[180px]:text-[11px] font-semibold px-2 @[140px]:px-2.5 @[180px]:px-3 py-0.5 @[140px]:py-1 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
                product.stock <= 0
                  ? "bg-neutral-800 text-white"
                  : "bg-primary text-primary-foreground"
              } opacity-100 pointer-events-auto md:${
                isHovered
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <ShoppingBag className="w-2.5 h-2.5 @[140px]:w-3 @[140px]:h-3" />
              {product.stock <= 0 ? "Notify" : "Shop"}
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist heart — outside Link so mobile taps are never intercepted by navigation */}
      <div
        className={`absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 z-20 transition-all duration-200
          opacity-100 translate-y-0
          md:${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
      >
        <WishlistButton
          productId={product._id}
          className="bg-transparent backdrop-blur-none shadow-none p-1 md:p-1.5"
          iconClassName="w-4 h-4 md:w-5 md:h-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] text-white"
        />
      </div>
    </motion.div>
  );
};

export default memo(ProductCard);
