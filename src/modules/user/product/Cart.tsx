"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Gift,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";
import { AddressSection } from "./AddressSection";

/* ─── Empty state illustration — Gift box themed ─── */
const EmptyCartIllustration = () => (
  <svg
    viewBox="0 0 300 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-64 h-56"
  >
    {/* Soft background circle */}
    <circle cx="150" cy="140" r="108" fill="#f3eeff" />

    {/* ── Gift box base ── */}
    <rect x="75" y="138" width="150" height="90" rx="10" fill="#e9daff" />
    <rect
      x="75"
      y="138"
      width="150"
      height="90"
      rx="10"
      stroke="#ad8de9"
      strokeWidth="2.5"
    />

    {/* Vertical ribbon on box */}
    <rect
      x="138"
      y="138"
      width="24"
      height="90"
      rx="0"
      fill="#c4aaff"
      opacity="0.7"
    />

    {/* ── Gift box lid ── */}
    <rect x="68" y="112" width="164" height="34" rx="9" fill="#d8c3ff" />
    <rect
      x="68"
      y="112"
      width="164"
      height="34"
      rx="9"
      stroke="#ad8de9"
      strokeWidth="2.5"
    />

    {/* Vertical ribbon on lid */}
    <rect x="138" y="112" width="24" height="34" fill="#b89fef" opacity="0.8" />

    {/* ── Bow — left loop ── */}
    <path
      d="M150 112 C130 90, 100 95, 108 112"
      stroke="#ad8de9"
      strokeWidth="3"
      strokeLinecap="round"
      fill="#e9daff"
    />
    {/* Bow — right loop */}
    <path
      d="M150 112 C170 90, 200 95, 192 112"
      stroke="#ad8de9"
      strokeWidth="3"
      strokeLinecap="round"
      fill="#e9daff"
    />
    {/* Bow center knot */}
    <circle cx="150" cy="112" r="7" fill="#ad8de9" />
    <circle cx="150" cy="112" r="3.5" fill="#f3eeff" />

    {/* ── Stars / decorative elements around the gift ── */}
    {/* top-left decoration */}
    <path
      d="M82 82 L84 74 L86 82 L94 84 L86 86 L84 94 L82 86 L74 84 Z"
      fill="#ad8de9"
      opacity="0.35"
    />
    {/* top-right decoration */}
    <path
      d="M218 78 L220 72 L222 78 L228 80 L222 82 L220 88 L218 82 L212 80 Z"
      fill="#c4aaff"
      opacity="0.5"
    />
    {/* bottom-right dot cluster */}
    <circle cx="242" cy="168" r="5" fill="#c4aaff" opacity="0.5" />
    <circle cx="254" cy="152" r="3" fill="#ad8de9" opacity="0.4" />
    {/* bottom-left dot */}
    <circle cx="58" cy="175" r="4" fill="#c4aaff" opacity="0.45" />
    <circle cx="68" cy="195" r="2.5" fill="#ad8de9" opacity="0.35" />
    {/* tiny star top center */}
    <path
      d="M150 52 L151.8 57.5 L157.5 57.5 L152.9 61 L154.8 66.5 L150 63 L145.2 66.5 L147.1 61 L142.5 57.5 L148.2 57.5 Z"
      fill="#ad8de9"
      opacity="0.3"
    />

    {/* ── Floating hearts ── */}
    <path
      d="M236 122 C236 119,240 116,243 119 C246 116,250 119,250 122 C250 127,243 133,243 133 C243 133,236 127,236 122 Z"
      fill="#c4aaff"
      opacity="0.55"
    />
    <path
      d="M52 130 C52 128,55 126,57 128 C59 126,62 128,62 130 C62 134,57 138,57 138 C57 138,52 134,52 130 Z"
      fill="#ad8de9"
      opacity="0.4"
    />
  </svg>
);

export const Cart = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const cartItems = useQuery(
    api.cart.getCartItems,
    session ? undefined : "skip",
  );
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const saveForLater = useMutation(api.cart.saveForLater);
  const moveToCart = useMutation(api.cart.moveToCart);
  const removeSaved = useMutation(api.cart.removeSavedItem);
  const savedItems = useQuery(
    api.cart.getSavedItems,
    session ? undefined : "skip",
  );
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingSavedId, setLoadingSavedId] = useState<string | null>(null);
  const [isPriceDetailsExpanded, setIsPriceDetailsExpanded] = useState(true);

  const SAVE_LIMIT = 20;

  /* ─── Loading state ─── */
  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading your cart…</p>
        </div>
      </div>
    );
  }

  /* ─── Not logged in ─── */
  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-1">
            Your cart is waiting
          </h2>
          <p className="text-neutral-500">Sign in to see your saved items.</p>
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-[15px] font-semibold transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const items = cartItems || [];

  /* ─── Price calculations ─── */
  const platformFee = 9;
  let totalMrp = 0;
  let totalPrice = 0;

  items.forEach((item) => {
    const productPrice = item.product.price || 0;
    const discount = item.product.discount || 0;
    const originalPrice = discount
      ? Math.round(productPrice / (1 - discount / 100))
      : productPrice;
    totalMrp += originalPrice * item.quantity;
    totalPrice += productPrice * item.quantity;
  });

  const totalDiscount = totalMrp - totalPrice;
  const finalAmount = totalPrice + platformFee;

  /* ─── Handlers ─── */
  const handleUpdateQuantity = async (cartItemId: any, newQty: number) => {
    try {
      setLoadingItemId(cartItemId);
      await updateQuantity({ cartItemId, quantity: newQty });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemove = async (cartItemId: any) => {
    try {
      setLoadingItemId(cartItemId);
      await removeFromCart({ cartItemId });
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleSaveForLater = async (cartItemId: any) => {
    try {
      setLoadingItemId(cartItemId);
      await saveForLater({ cartItemId });
      toast.success("Saved for later!");
    } catch (e: any) {
      toast.error(e?.message || "Could not save item");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleMoveToCart = async (savedItemId: any) => {
    try {
      setLoadingSavedId(savedItemId);
      await moveToCart({ savedItemId });
      toast.success("Moved to cart!");
    } catch (e: any) {
      toast.error(e?.message || "Could not move to cart");
    } finally {
      setLoadingSavedId(null);
    }
  };

  const handleRemoveSaved = async (savedItemId: any) => {
    try {
      setLoadingSavedId(savedItemId);
      await removeSaved({ savedItemId });
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setLoadingSavedId(null);
    }
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#faf9ff] py-5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Page heading */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800">My Cart</h1>
          {items.length > 0 && (
            <span className="inline-flex items-center justify-center bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left column ── */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Address selector banner */}
            {items.length > 0 && <AddressSection defaultExpanded={false} />}

            {/* Cart items container */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              {/* Loading skeleton */}
              {cartItems === undefined && (
                <div className="p-8 flex flex-col gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-24 h-24 bg-neutral-100 rounded-xl shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-neutral-100 rounded w-3/4" />
                        <div className="h-3 bg-neutral-100 rounded w-1/2" />
                        <div className="h-5 bg-neutral-100 rounded w-1/4 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {cartItems !== undefined && items.length === 0 && (
                <div className="p-12 flex flex-col items-center gap-5">
                  <EmptyCartIllustration />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-1">
                      Your cart is empty!
                    </h3>
                    <p className="text-neutral-500 text-[14px]">
                      Looks like you haven't added anything yet.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-[15px] font-semibold transition-all shadow-md shadow-primary/20"
                  >
                    <Gift className="w-4 h-4" />
                    Explore Gifts
                  </Link>
                </div>
              )}

              {/* Cart items list */}
              {items.map((item) => {
                const product = item.product;
                const discount = product.discount || 0;
                const originalPrice = discount
                  ? Math.round(product.price / (1 - discount / 100))
                  : product.price;

                return (
                  <div
                    key={item._id}
                    className="border-b border-neutral-100 last:border-b-0 relative group/item hover:bg-neutral-50/60 transition-colors duration-150"
                  >
                    {/* Overlay while mutating */}
                    {loadingItemId === item._id && (
                      <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[2px] rounded-none">
                        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    <div className="p-5 sm:p-6 flex gap-5">
                      {/* Thumbnail */}
                      <Link
                        href={`/product/${item.product._id}`}
                        className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] relative bg-neutral-50 rounded-xl overflow-hidden shrink-0 border border-neutral-100 group"
                      >
                        <Image
                          src={
                            product.thumbnail ||
                            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop"
                          }
                          alt={product.name}
                          fill
                          sizes="110px"
                          className="object-cover p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                        {discount > 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            {discount}% OFF
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product._id}`}>
                          <h3 className="text-[15px] font-medium text-neutral-800 hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[12px] text-neutral-400 mt-0.5 capitalize">
                          {product.category.replace(/-/g, " ")}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            4.5 <Star className="w-2.5 h-2.5 fill-white" />
                          </div>
                          <span className="text-[12px] text-neutral-400">
                            (120 reviews)
                          </span>
                        </div>

                        {/* Price row */}
                        <div className="flex items-baseline gap-2 mt-2.5">
                          <span className="text-lg font-bold text-neutral-900">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {discount > 0 && (
                            <>
                              <span className="text-[13px] text-neutral-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[12px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                {discount}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Delivery info */}
                        <p className="mt-2 text-[12px] text-neutral-500">
                          🚚 Delivery in{" "}
                          <span className="font-semibold text-neutral-700">
                            3–5 business days
                          </span>
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() =>
                              item.quantity > 1 &&
                              handleUpdateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || loadingItemId === item._id
                            }
                            className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-[14px] font-semibold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={loadingItemId === item._id}
                            className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex divide-x divide-neutral-100 border-t border-neutral-100">
                      <button
                        onClick={() => handleSaveForLater(item._id)}
                        disabled={loadingItemId === item._id}
                        className="cursor-pointer flex-1 py-3 text-[13px] font-medium text-neutral-500 hover:text-primary flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save for later
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={loadingItemId === item._id}
                        className="cursor-pointer flex-1 py-3 text-[13px] font-medium text-neutral-500 hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/checkout?productId=${item.product._id}&quantity=${item.quantity}`,
                          )
                        }
                        className="cursor-pointer flex-1 py-3 text-[13px] font-semibold text-primary hover:text-primary/80 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Buy Now
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust badges */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm py-3 px-6 flex items-center justify-between divide-x divide-neutral-100">
                {[
                  { icon: ShieldCheck, label: "Safe & Secure Payments" },
                  { icon: CheckCircle2, label: "100% Authentic Products" },
                  { icon: Lock, label: "Easy Returns & Refunds" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex-1 flex items-center justify-center gap-2 text-[12px] text-neutral-500 px-4 first:pl-0 last:pr-0"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Note: Saved for Later section has been moved below the flex columns */}
          </div>

          {/* ── Right column — Price summary ── */}
          {items.length > 0 && (
            <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden sticky top-24">
                {/* Header */}
                <div
                  onClick={() =>
                    setIsPriceDetailsExpanded(!isPriceDetailsExpanded)
                  }
                  className="px-6 py-3.5 border-b border-neutral-100 bg-gradient-to-r from-primary/8 to-primary/2 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PackageCheck className="w-4 h-4 text-primary shrink-0" />
                    <h2 className="text-[12px] font-bold text-primary uppercase tracking-widest truncate">
                      Price Details
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isPriceDetailsExpanded && (
                      <span className="text-xs font-bold text-primary mr-1">
                        ₹{finalAmount.toLocaleString("en-IN")}
                      </span>
                    )}
                    {isPriceDetailsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>

                {/* Line items */}
                {isPriceDetailsExpanded && (
                  <div className="px-6 pt-5 pb-4 flex flex-col gap-4 text-left">
                    <div className="flex justify-between text-[14px] text-neutral-700">
                      <span>
                        Price ({items.length} item
                        {items.length !== 1 ? "s" : ""})
                      </span>
                      <span className="font-medium">
                        ₹{totalMrp.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-[14px] text-neutral-700">
                        <span>Discount</span>
                        <span className="font-medium text-green-600">
                          − ₹{totalDiscount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[14px] text-neutral-700">
                      <span>Platform Fee</span>
                      <span className="font-medium">₹{platformFee}</span>
                    </div>

                    <div className="flex justify-between text-[14px] text-neutral-700">
                      <span>Delivery Charges</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>

                    {/* Savings callout */}
                    {totalDiscount > 0 && (
                      <div className="text-green-700 font-medium text-[12px] bg-green-50 border border-green-100 px-3.5 py-2 rounded-lg flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        You save ₹{totalDiscount.toLocaleString("en-IN")} on
                        this order!
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                      <span className="text-[15px] font-bold text-neutral-800">
                        Total Amount
                      </span>
                      <span className="text-[17px] font-extrabold text-primary">
                        ₹{finalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="p-4 border-t border-neutral-100">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-gradient-to-r from-primary to-[#c4aaff] hover:from-[#9063ec] hover:to-[#b08bff] hover:shadow-xl hover:shadow-primary/30 text-white py-4 rounded-xl text-[15px] font-bold tracking-wide shadow-lg shadow-primary/25 transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Place Order Securely
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center mt-2.5 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span>100% secure &amp; encrypted checkout</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Saved for later section (placed full-width below checkout details) ── */}
        {savedItems && savedItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden mt-6">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-neutral-100 bg-gradient-to-r from-primary/8 to-primary/2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-primary" />
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-widest">
                  Saved for Later
                </h3>
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedItems.length}/{SAVE_LIMIT}
                </span>
              </div>
              {/* Save limit progress */}
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(savedItems.length / SAVE_LIMIT) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Saved items */}
            {savedItems.map((saved) => (
              <div
                key={saved._id}
                className="border-b border-neutral-100 last:border-b-0 relative"
              >
                {loadingSavedId === saved._id && (
                  <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="p-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${saved.product._id}`}
                    className="w-20 h-20 relative bg-neutral-50 rounded-xl overflow-hidden shrink-0 border border-neutral-100"
                  >
                    <Image
                      src={
                        saved.product.thumbnail ||
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600"
                      }
                      alt={saved.product.name}
                      fill
                      sizes="80px"
                      className="object-cover p-1"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${saved.product._id}`}>
                      <p className="text-[13px] font-medium text-neutral-800 hover:text-primary transition-colors line-clamp-2">
                        {saved.product.name}
                      </p>
                    </Link>
                    <p className="text-[12px] text-neutral-400 mt-0.5 capitalize">
                      {saved.product.category.replace(/-/g, " ")}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-[14px] font-bold text-neutral-900">
                        ₹{saved.product.price.toLocaleString("en-IN")}
                      </span>
                      {saved.product.discount && saved.product.discount > 0 && (
                        <span className="text-[11px] font-semibold text-green-600">
                          {saved.product.discount}% off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex divide-x divide-neutral-100 border-t border-neutral-100">
                  <button
                    onClick={() => handleMoveToCart(saved._id)}
                    disabled={loadingSavedId === saved._id}
                    className="cursor-pointer flex-1 py-2.5 text-[12px] font-semibold text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveSaved(saved._id)}
                    disabled={loadingSavedId === saved._id}
                    className="cursor-pointer flex-1 py-2.5 text-[12px] font-medium text-neutral-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
