"use client";

import { Rating } from "@mui/material";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  MessageCircle,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { productDetailUrl } from "@/lib/imagekit-url";
import { api } from "../../../../convex/_generated/api";
import WishlistButton from "../components/WishlistButton";

interface ProductDetailsProps {
  product: any; // We'll pass the convex product here
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    couponId: string;
    discountType: "percentage" | "flat" | "free_shipping";
    discountValue: number;
    discountAmount: number;
    message: string;
  } | null>(null);

  // Notify Me states
  const { data: session } = authClient.useSession();
  const [isSubmittingNotification, setIsSubmittingNotification] =
    useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState("");

  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const addToCart = useMutation(api.cart.addToCart);
  const requestNotification = useMutation(
    api.products.requestStockNotification,
  );
  const cartItems = useQuery(
    api.cart.getCartItems,
    session ? undefined : "skip",
  );
  const isAlreadyInCart =
    cartItems?.some((item) => item.product._id === product._id) ?? false;

  // Fetch active coupons from backend for "Available Offers"
  const activeCoupons = useQuery(api.coupons.listActiveForUser, {
    userId: session?.user?.id,
  });

  const userEmail = session?.user?.email || "";

  const allImages = [product?.thumbnail, ...(product?.images || [])]
    .filter(Boolean)
    .map((src: string) => productDetailUrl(src));
  if (allImages.length === 0) {
    allImages.push(
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    );
  }

  // Build unified media items (images + videos)
  const mediaItems: { type: "image" | "video"; url: string }[] = [];
  const addedUrls = new Set<string>();

  if (product?.thumbnail) {
    const optimized = productDetailUrl(product.thumbnail);
    mediaItems.push({ type: "image", url: optimized });
    addedUrls.add(product.thumbnail);
  }

  // Include video only if present/uploaded in backend
  if (product?.videoUrl) {
    mediaItems.push({ type: "video", url: product.videoUrl });
  }

  if (product?.images) {
    product.images.forEach((img: string) => {
      if (!addedUrls.has(img)) {
        mediaItems.push({ type: "image", url: productDetailUrl(img) });
        addedUrls.add(img);
      }
    });
  }

  if (mediaItems.length === 0) {
    mediaItems.push({
      type: "image",
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    });
  }

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(
    mediaItems.length > 1 ? 1 : 0,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset slider index when product or images list changes
  useEffect(() => {
    setCurrentIndex(mediaItems.length > 1 ? 1 : 0);
    setTransitionEnabled(true);
    setIsTransitioning(false);
  }, []);

  const slides =
    mediaItems.length > 1
      ? [mediaItems[mediaItems.length - 1], ...mediaItems, mediaItems[0]]
      : mediaItems;

  // Compute active display index (1-based index corresponding to mediaItems)
  const getDisplayIndex = () => {
    if (mediaItems.length <= 1) return 1;
    if (currentIndex === 0) return mediaItems.length;
    if (currentIndex === mediaItems.length + 1) return 1;
    return currentIndex;
  };

  const _selectedImage =
    mediaItems[getDisplayIndex() - 1]?.url || mediaItems[0]?.url;

  const handleNext = () => {
    if (mediaItems.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (mediaItems.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const changeImage = (idx: number) => {
    if (mediaItems.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setTransitionEnabled(true);
    setCurrentIndex(idx + 1);
  };

  // Transition reset effect for looping infinite slides
  useEffect(() => {
    if (mediaItems.length <= 1) return;

    let timeoutId: NodeJS.Timeout;
    let transitionTimeoutId: NodeJS.Timeout;

    if (currentIndex === mediaItems.length + 1) {
      // Slid past the last item to the duplicate of the first item
      timeoutId = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(1);
        transitionTimeoutId = setTimeout(() => {
          setTransitionEnabled(true);
          setIsTransitioning(false);
        }, 30);
      }, 300); // 300ms transition duration
    } else if (currentIndex === 0) {
      // Slid backwards past the first item to the duplicate of the last item
      timeoutId = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(mediaItems.length);
        transitionTimeoutId = setTimeout(() => {
          setTransitionEnabled(true);
          setIsTransitioning(false);
        }, 30);
      }, 300); // 300ms transition duration
    } else {
      // Normal slide
      timeoutId = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(transitionTimeoutId);
    };
  }, [currentIndex]);

  // Auto-slide effect for mobile image gallery (4s interval, resets on manual interaction)
  useEffect(() => {
    if (!isMobile || mediaItems.length <= 1) return;

    // Do not auto-slide if the currently viewed item is a video
    const currentItem = mediaItems[getDisplayIndex() - 1];
    if (currentItem?.type === "video") return;

    const timer = setTimeout(() => {
      handleNext();
    }, 4000);

    return () => clearTimeout(timer);
  }, [isMobile, getDisplayIndex, handleNext]);

  // Pricing with dynamic coupon support
  const basePrice = product?.price || 690;
  const productDiscountPercent = product?.discount || 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  const displayPrice = Math.max(0, basePrice - couponDiscount);

  const displayOriginalPrice =
    productDiscountPercent > 0 || couponDiscount > 0
      ? Math.round(basePrice / (1 - productDiscountPercent / 100))
      : null;

  const discountPercent =
    productDiscountPercent +
    (appliedCoupon?.discountType === "percentage"
      ? appliedCoupon.discountValue
      : 0);

  // Fetch real reviews to display rating stats dynamically
  const reviews = useQuery(api.reviews.listProductReviews, {
    productId: product._id,
  });
  const reviewCount = reviews ? reviews.length : 0;
  const ratingValue =
    reviews && reviews.length > 0
      ? parseFloat(
          (
            reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            reviews.length
          ).toFixed(1),
        )
      : 5;
  const productSeed = product?._id
    ? product._id
        .toString()
        .split("")
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    : 0;
  const boughtCount = `${(1000 + (productSeed % 400)).toLocaleString("en-IN")}+`;
  const _isPersonalised = product?.category === "hampers";

  /* ── Share handler ── */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Check out this product",
          text: `Check out ${product?.name} on upharVilla!`,
          url,
        });
      } catch {
        // User cancelled share or error — fall back silently
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Could not copy link.");
      }
    }
  };

  /* ── Coupon Code Handlers (backend-driven) ── */
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const convex = useConvex();

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (!session?.user?.id) {
      toast.error("Please sign in to apply coupon codes.");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await convex.query(api.coupons.validateCoupon, {
        code,
        userId: session.user.id,
        cartTotal: product?.price || 0,
        productCategory: product?.category,
        productId: product?._id,
      });

      if (result.valid) {
        setAppliedCoupon({
          code: result.code,
          couponId: result.couponId,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discountAmount: result.discountAmount,
          message: result.message,
        });
        toast.success(result.message);
      } else {
        toast.error(result.reason);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to validate coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed.");
  };

  /* ── Add to cart + Buy Now handler ── */
  const handleAddToCart = async () => {
    if (isAddedToCart || isAlreadyInCart) {
      router.push("/cart");
      return;
    }
    if (isLoading) {
      toast.info("Please wait, loading authentication state...");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth");
      return;
    }
    try {
      setIsAdding(true);
      await addToCart({ productId: product._id, quantity: 1 });
      setIsAddedToCart(true);
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isLoading) {
      toast.info("Please wait, loading authentication state...");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      router.push("/auth");
      return;
    }

    try {
      setIsAdding(true);

      // Flipkart-style: ensure item is in cart before checkout.
      // If already in cart, skip the add — use existing cart quantity.
      if (!isAlreadyInCart) {
        await addToCart({ productId: product._id, quantity: 1 });
        setIsAddedToCart(true);
      }

      // Build checkout URL with product-specific params
      const qty = isAlreadyInCart
        ? (cartItems?.find((item) => item.product._id === product._id)
            ?.quantity ?? 1)
        : 1;
      const couponQuery = appliedCoupon ? `&coupon=${appliedCoupon.code}` : "";

      router.push(
        `/checkout?productId=${product._id}&quantity=${qty}${couponQuery}`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to proceed. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-12 pt-3 sm:pt-4 md:pt-6 pb-6 sm:pb-8 md:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16">
        {/* Left: Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-2 sm:gap-3 md:gap-4 h-auto md:h-[500px] lg:h-[560px] xl:h-[620px]">
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-1.5 sm:gap-2 md:gap-2.5 w-full md:w-20 lg:w-[88px] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto hidden-scrollbar">
            {mediaItems.map((item, idx) => {
              const isActive = getDisplayIndex() - 1 === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`cursor-pointer relative min-w-12 min-h-12 w-14 h-14 sm:min-w-14 sm:min-h-14 sm:w-16 sm:h-16 md:w-full md:h-auto md:aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 flex-shrink-0 md:flex-shrink transition-all ${
                    isActive
                      ? "border-primary"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                  onClick={() => changeImage(idx)}
                >
                  {item.type === "video" ? (
                    <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-60">
                        <Image
                          src={
                            product?.thumbnail ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                          }
                          alt="Video Thumbnail"
                          fill
                          sizes="80px"
                          className="object-cover blur-[1px]"
                        />
                      </div>
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <svg
                          className="w-4 h-4 fill-primary text-primary ml-0.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={`Thumbnail ${idx}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Image/Video */}
          <div className="relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden bg-white aspect-[4/3] max-h-[280px] sm:max-h-[380px] md:max-h-none md:aspect-auto">
            {/* Sliding strip */}
            <div
              className={`flex h-full ${transitionEnabled ? "transition-transform duration-300 ease-in-out" : "transition-none"}`}
              style={{
                width: `${slides.length * 100}%`,
                transform: `translateX(-${(currentIndex * 100) / slides.length}%)`,
              }}
            >
              {slides.map(
                (
                  item: { type: "image" | "video"; url: string },
                  idx: number,
                ) => (
                  <div
                    key={idx}
                    className="relative h-full flex-none"
                    style={{ width: `${100 / slides.length}%` }}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <video
                          src={item.url}
                          controls
                          playsInline
                          muted
                          autoPlay
                          loop
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <Image
                        src={item.url}
                        alt={`${product?.name || "Product"} ${idx}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                        priority={idx === (mediaItems.length > 1 ? 1 : 0)}
                      />
                    )}
                  </div>
                ),
              )}
            </div>

            {/* Left/Right navigation chevrons for mobile */}
            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-neutral-800 shadow-sm md:hidden z-10 active:scale-95 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-neutral-800 shadow-sm md:hidden z-10 active:scale-95 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-700" />
                </button>
              </>
            )}

            {/* Pagination Index Badge (Mobile Only) */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 bg-black/45 text-white text-[10px] font-sans font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs select-none md:hidden">
                {getDisplayIndex()} / {mediaItems.length}
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Title & Share */}
          <div className="flex justify-between items-start gap-2 sm:gap-3 md:gap-4">
            <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
              <div className="flex flex-wrap gap-1.5 items-center">
                {product?.markMostSold && (
                  <span className="bg-[#E2AF3E]/10 text-[#E2AF3E] text-[9px] sm:text-[10px] font-sans font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border border-[#E2AF3E]/20 uppercase">
                    Most Sold
                  </span>
                )}
                {product?.markTrending && (
                  <span className="bg-[#FC2779]/10 text-[#FC2779] text-[9px] sm:text-[10px] font-sans font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border border-[#FC2779]/20 uppercase">
                    Trending
                  </span>
                )}
                {product?.markNewArrival && (
                  <span className="bg-[#0D9488]/10 text-[#0D9488] text-[9px] sm:text-[10px] font-sans font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border border-[#0D9488]/20 uppercase">
                    New Arrival
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-neutral-800 capitalize leading-tight">
                {product?.name || "Product Name"}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-0.5 sm:mt-1">
              {/* Wishlist Heart */}
              <WishlistButton
                productId={product._id}
                className="p-1.5 sm:p-2 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-all"
                iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="cursor-pointer flex items-center justify-center p-1.5 sm:p-2 md:px-3 md:py-1.5 border border-neutral-200 rounded-full md:rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all"
                title="Share Product"
              >
                <span className="hidden md:inline mr-1.5 text-xs lg:text-sm font-medium">
                  Share
                </span>
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>

          {/* Ratings & Bought Count unified box */}
          <div className="flex flex-col gap-1.5 sm:gap-2 bg-neutral-50 p-2.5 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl border border-neutral-100/50">
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Rating
                  name="read-only"
                  value={ratingValue}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ color: "#000", fontSize: { xs: "0.9rem", sm: "1rem" } }}
                />
                <span className="text-[11px] sm:text-xs font-semibold text-neutral-800">
                  {ratingValue}
                </span>
                <span className="text-[11px] sm:text-xs text-neutral-500">
                  ({reviewCount} reviews)
                </span>
              </div>
              <div className="h-3 w-px bg-neutral-200 hidden sm:block" />
              <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-emerald-700 font-medium">
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>{boughtCount} bought recently</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-end gap-1.5 sm:gap-2 md:gap-2.5">
                {displayOriginalPrice && (
                  <span className="text-sm sm:text-base md:text-lg text-neutral-400 line-through font-medium">
                    Rs. {displayOriginalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 transition-all duration-350">
                  Rs. {displayPrice.toLocaleString("en-IN")}
                </span>
                {(discountPercent > 0 || couponDiscount > 0) && (
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-rose-500 mb-0.5 bg-rose-50 px-1.5 sm:px-2 py-0.5 rounded-md animate-pulse">
                    {couponDiscount > 0 && appliedCoupon
                      ? `Save ₹${couponDiscount} (${appliedCoupon.code})`
                      : `Save ${discountPercent}%`}
                  </span>
                )}
              </div>
              {product?.stock <= 0 && (
                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-500">
              (Inclusive of all taxes)
            </span>
          </div>

          {/* Action Buttons */}
          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <button
                  type="button"
                  onClick={() => setShowLoginPrompt(false)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogIn className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800">
                    Login Required
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Please log in to get notified when this product is back in
                    stock.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginPrompt(false);
                      router.push("/auth");
                    }}
                    className="mt-2 w-full bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Login / Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {product?.stock <= 0 ? (
            <div className="bg-neutral-50/50 border border-neutral-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-2 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5 sm:gap-2">
                  <Bell className="w-4 h-4 text-primary animate-bounce" />
                  Out of Stock Notification
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
                  This product is currently out of stock. Get notified when it's
                  back!
                </p>
              </div>

              {notificationSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  We'll notify you at{" "}
                  <strong className="font-bold">
                    {userEmail || fallbackEmail}
                  </strong>{" "}
                  when back in stock.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Email input only shown when logged in but no email in profile */}
                  {session?.user && !userEmail && (
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={fallbackEmail}
                      onChange={(e) => setFallbackEmail(e.target.value)}
                      className="border border-neutral-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white"
                    />
                  )}

                  {/* Email Notify Button */}
                  <button
                    type="button"
                    disabled={
                      isSubmittingNotification ||
                      (session?.user && !userEmail && !fallbackEmail)
                    }
                    onClick={async () => {
                      // Not logged in — show login popup
                      if (!session?.user) {
                        setShowLoginPrompt(true);
                        return;
                      }
                      const emailToUse = userEmail || fallbackEmail.trim();
                      if (!emailToUse || !/\S+@\S+\.\S+/.test(emailToUse)) {
                        toast.error("Please enter a valid email address.");
                        return;
                      }
                      // Submit notification
                      try {
                        setIsSubmittingNotification(true);
                        const res = await requestNotification({
                          productId: product._id,
                          email: emailToUse,
                        });
                        setNotificationSuccess(true);
                        if (res.alreadyExists) {
                          toast.info(
                            "You've already requested a notification for this product!",
                          );
                        } else {
                          toast.success(
                            "You'll be notified via email when back in stock!",
                          );
                        }
                      } catch (err: any) {
                        toast.error(
                          err?.message || "Failed to register request.",
                        );
                      } finally {
                        setIsSubmittingNotification(false);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground font-bold tracking-wider text-[11px] sm:text-xs px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg sm:rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase w-full"
                  >
                    <Bell className="w-4 h-4" />
                    {isSubmittingNotification
                      ? "Submitting..."
                      : "Notify Me via Email"}
                  </button>

                  {/* WhatsApp Notify */}
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="WhatsApp number (e.g. 9876543210)"
                      value={whatsappNumber}
                      onChange={(e) =>
                        setWhatsappNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="flex-1 border border-neutral-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all bg-white"
                    />
                    <button
                      type="button"
                      disabled={whatsappNumber.length !== 10}
                      onClick={() => {
                        if (!session?.user) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        toast.success(
                          `We'll notify you on WhatsApp at ${whatsappNumber} when back in stock!`,
                        );
                        setWhatsappNumber("");
                      }}
                      className="flex items-center gap-1 sm:gap-1.5 bg-green-500 text-white font-bold tracking-wider text-[11px] sm:text-xs px-3 sm:px-5 py-3 sm:py-3.5 rounded-lg sm:rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 uppercase"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 sm:gap-3 md:gap-4 w-full mt-1 sm:mt-2">
              <button
                type="button"
                disabled={isAdding}
                onClick={handleAddToCart}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-sm hover:shadow-md font-semibold tracking-wider text-[11px] sm:text-xs md:text-sm py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 uppercase ${
                  isAddedToCart || isAlreadyInCart
                    ? "bg-[#F5F5DC] border-[#F5F5DC] text-neutral-800"
                    : "bg-white border border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
                } ${isAdding ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                {isAdding
                  ? "Adding..."
                  : isAddedToCart || isAlreadyInCart
                    ? "Go to Cart"
                    : "Add to Cart"}
              </button>
              <button
                type="button"
                disabled={isAdding}
                onClick={handleBuyNow}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:to-primary/70 font-semibold tracking-wider text-[11px] sm:text-xs md:text-sm py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 uppercase ${isAdding ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                Buy Now
              </button>
            </div>
          )}

          {/* Value Props - Premium Badges */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-3 sm:py-4 px-1.5 sm:px-2 bg-neutral-50/50 rounded-lg sm:rounded-xl border border-neutral-100/80">
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                Free Shipping
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                100% Secure
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                Easy Returns
              </span>
            </div>
          </div>

          {/* Coupon Input Section */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Apply Coupon Code
            </span>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100/80 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    {appliedCoupon.message}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="relative flex items-center border border-neutral-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 rounded-lg sm:rounded-xl overflow-hidden transition-all bg-white">
                <Tag className="w-4 h-4 text-neutral-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="flex-1 px-2.5 sm:px-3 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm bg-transparent outline-none border-none placeholder:text-neutral-400 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || isValidatingCoupon}
                  className="mr-1 sm:mr-1.5 bg-primary text-primary-foreground hover:opacity-90 disabled:bg-neutral-100 disabled:text-neutral-400 font-bold text-[11px] sm:text-xs px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg transition-all uppercase disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  {isValidatingCoupon ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Offers — Dynamic from Backend */}
          {activeCoupons && activeCoupons.length > 0 && (
            <div className="pt-2">
              <h4 className="text-[11px] sm:text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2 sm:mb-3">
                Available Offers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {activeCoupons.map((coupon) => {
                  const isUsed = coupon.userHasUsed;
                  const label =
                    coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : coupon.discountType === "flat"
                        ? `₹${coupon.discountValue} OFF`
                        : "Free Shipping";
                  return (
                    <button
                      key={coupon._id}
                      type="button"
                      disabled={isUsed}
                      onClick={() => {
                        if (!isUsed) {
                          setCouponInput(coupon.code);
                        }
                      }}
                      className={`cursor-pointer text-left border border-dashed rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-3.5 flex flex-col gap-0.5 sm:gap-1 transition-colors ${
                        isUsed
                          ? "border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed"
                          : "border-primary/40 bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase ${
                            isUsed ? "bg-neutral-400" : "bg-primary"
                          }`}
                        >
                          {coupon.code}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-neutral-800">
                          {label}
                        </span>
                        {isUsed && (
                          <span className="text-[9px] font-bold text-rose-500 ml-auto">
                            Used
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-neutral-600 leading-relaxed mt-0.5 sm:mt-1">
                        {coupon.description}
                        {coupon.minOrderAmount
                          ? ` (Min order: ₹${coupon.minOrderAmount})`
                          : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
