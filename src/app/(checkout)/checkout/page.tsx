"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AddressSection from "@/modules/user/product/AddressSection";
import { api } from "../../../../convex/_generated/api";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutProductId = searchParams.get("productId") || undefined;
  const checkoutQuantity = searchParams.get("quantity")
    ? Number(searchParams.get("quantity"))
    : undefined;
  const couponCode = searchParams.get("coupon") || undefined;
  const { data: session, isPending } = authClient.useSession();

  // Convex endpoints
  const reserve = useMutation(api.checkout.reserveStock);
  const activeReservations = useQuery(api.checkout.getActiveReservations);
  const createRazorpayOrder = useAction(api.checkout.createRazorpayOrder);
  const completeCheckout = useMutation(api.checkout.completeCheckout);
  const releaseReservations = useMutation(api.checkout.releaseReservations);
  const addresses = useQuery(api.addresses.list);

  // ── Coupon validation (server-side computed discount) ─────────────────────
  // Compute cart total from reservations so we can validate the coupon server-side.
  // This ensures the discount shown to the user matches what Razorpay charges.
  const cartTotalForCoupon = (activeReservations || []).reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const couponValidation = useQuery(
    api.coupons.validateCoupon,
    couponCode && session?.user?.id && cartTotalForCoupon > 0
      ? {
          code: couponCode,
          userId: session.user.id,
          cartTotal: cartTotalForCoupon,
        }
      : "skip",
  );
  const couponDiscount = couponValidation?.valid
    ? couponValidation.discountAmount
    : 0;
  const appliedCouponCode = couponValidation?.valid
    ? couponValidation.code
    : null;

  // Component states
  const [isReserving, setIsReserving] = useState(true);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  // Accordion states for Flipkart-style checkout
  const [_activeStep, _setActiveStep] = useState<1 | 2>(1);
  const [_confirmedAddressId, setConfirmedAddressId] = useState<string | null>(
    null,
  );

  // Run stock reservation on mount
  useEffect(() => {
    if (isPending || !session) return;

    let active = true;
    const runReservation = async () => {
      try {
        await reserve({
          productId: checkoutProductId,
          quantity: checkoutQuantity,
        });
      } catch (err: any) {
        if (active) {
          setReserveError(
            err.message || "Failed to lock inventory for checkout.",
          );
          toast.error(err.message || "Reservation failed");
        }
      } finally {
        if (active) {
          setIsReserving(false);
        }
      }
    };

    runReservation();
    return () => {
      active = false;
    };
  }, [reserve, isPending, session, checkoutProductId, checkoutQuantity]);

  // Synchronize timer with backend lock time
  useEffect(() => {
    if (activeReservations && activeReservations.length > 0) {
      const minTime = Math.min(...activeReservations.map((r) => r.timeLeftMs));
      setTimeLeft(minTime);
    }
  }, [activeReservations]);

  // Start checkout countdown ticker
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle manual reservation release on navigating away
  const handleBackToCart = async () => {
    try {
      await releaseReservations();
    } catch (e) {
      console.error("Failed to release reservations", e);
    }
    router.push("/cart");
  };

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf9ff]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-neutral-500 text-sm">Verifying session details…</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 bg-[#faf9ff]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-1">
            Sign in to checkout
          </h2>
          <p className="text-neutral-500">
            You need to log in to complete your transaction.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Stock hold failed (out of stock state)
  if (reserveError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 bg-[#faf9ff]">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Item Unavailable
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-4">
            {reserveError}
          </p>
          <p className="text-neutral-400 text-xs">
            Another customer has already reserved the remaining stock for one of
            your items.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Cart
        </button>
      </div>
    );
  }

  // Initial reservation lock loader
  if (isReserving || !activeReservations) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#faf9ff]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-neutral-500 text-sm">
            Reserving stock for checkout session…
          </p>
        </div>
      </div>
    );
  }

  const items = activeReservations;
  const isExpired = false; // Expiration validated strictly on the backend

  // Retrieve delivery address
  const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0];

  // Pricing calculations
  const platformFee = 9;
  let totalMrp = 0;
  let totalPrice = 0;

  items.forEach((item) => {
    const productPrice = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    const originalPrice = discount
      ? Math.round(productPrice / (1 - discount / 100))
      : productPrice;
    totalMrp += originalPrice * item.quantity;
    totalPrice += productPrice * item.quantity;
  });

  const totalDiscount = totalMrp - totalPrice;
  const finalAmount = Math.max(0, totalPrice - couponDiscount) + platformFee;
  const totalSavings = totalDiscount + couponDiscount;

  // Trigger Razorpay payment gateway
  const handleInitiatePayment = async () => {
    if (!defaultAddr) {
      setShowAddressPopup(true);
      return;
    }
    if (isExpired) {
      toast.error(
        "Your reservation lock has expired. Return to cart to refresh stock.",
      );
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Create the Razorpay Order on the backend action
      // Amount is computed SERVER-SIDE from DB prices — no client arg
      const order = await createRazorpayOrder({ couponCode });

      // 2. Setup Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "upharVilla",
        description: "Complete your gift purchase",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setIsProcessingPayment(true);
            // 3. Complete the checkout signature verification and orders insertion on Convex
            const finalOrderId = await completeCheckout({
              addressId: defaultAddr._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode,
            });

            setPaymentSuccessId(finalOrderId);
            toast.success("Payment successful! Order placed.");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: defaultAddr.fullName,
          contact: defaultAddr.phone,
        },
        theme: {
          color: "#ad8de9",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Failed to initiate Razorpay checkout.");
      setIsProcessingPayment(false);
    }
  };

  // ── CONFIRMATION / ORDER SUCCESS SCREEN ──
  if (paymentSuccessId) {
    return (
      <div className="min-h-screen bg-[#faf9ff] py-12 px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-100 shadow-xl p-8 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-green-50 rounded-full border border-green-100 flex items-center justify-center text-green-500 scale-105 transition-all">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
              Order Confirmed
            </span>
            <h1 className="text-2xl font-bold text-neutral-800 mt-3">
              Thank You for Your Order!
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Your gift booking is processed. We've locked your items for
              delivery.
            </p>
          </div>

          <div className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-left flex flex-col gap-2.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Order Reference ID</span>
              <span className="font-semibold text-neutral-800">
                {paymentSuccessId}
              </span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Total Amount Paid</span>
              <span className="font-semibold text-neutral-800">
                ₹{finalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Shipping to</span>
              <span className="font-semibold text-neutral-800 truncate max-w-[180px]">
                {defaultAddr?.fullName || ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Link
              href="/"
              className="bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Time metrics
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const _timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const _isUrgent = timeLeft > 0 && timeLeft < 2 * 60 * 1000; // less than 2 minutes

  return (
    <div className="min-h-screen bg-[#faf9ff] py-8 relative">
      {/* ── Main checkout dashboard ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back to cart */}
        <button
          type="button"
          onClick={handleBackToCart}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Return to Cart
        </button>

        {/* Lock expired screen overlay */}
        {isExpired && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between bg-red-50 border border-red-100 text-red-800 rounded-2xl p-5 gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Stock Lock Expired
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  The checkout session timed out. The reserved warehouse stock
                  has been released.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBackToCart}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              Refresh Reservation
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left Column: Accordion steps ── */}
          <div className="flex-1 flex flex-col gap-4 w-full">
            {/* Step 1: DELIVERY ADDRESS */}
            <div
              id="address-section"
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden text-left scroll-mt-20"
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-primary/8 to-primary/2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      defaultAddr
                        ? "bg-green-500 text-white"
                        : "bg-primary text-white"
                    }`}
                  >
                    {defaultAddr ? "✓" : "1"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      1. Delivery Address
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="border-t border-neutral-100">
                <AddressSection
                  noBorder
                  defaultExpanded={true}
                  onConfirmAddress={(addressId) => {
                    setConfirmedAddressId(addressId);
                  }}
                />
              </div>
            </div>

            {/* Step 2: ORDER SUMMARY & PAYMENT */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden text-left">
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-primary/8 to-primary/2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 bg-primary text-white">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      2. Order Summary & Payment
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div>
                {/* Items list */}
                <div className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const product = item.product;
                    const discount = product?.discount || 0;
                    const itemPrice = product?.price || 0;
                    const originalPrice = discount
                      ? Math.round(itemPrice / (1 - discount / 100))
                      : itemPrice;

                    return (
                      <div
                        key={item._id}
                        className="p-5 flex gap-4 items-center"
                      >
                        <div className="w-16 h-16 relative bg-neutral-50 rounded-xl overflow-hidden shrink-0 border border-neutral-100">
                          <Image
                            src={
                              product?.thumbnail ||
                              "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=200"
                            }
                            alt={product?.name || "Product"}
                            fill
                            sizes="64px"
                            className="object-cover p-0.5"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-[13px] font-medium text-neutral-800 line-clamp-2">
                            {product?.name || "Loading product..."}
                          </h4>
                          <p className="text-[11px] text-neutral-400 capitalize mt-1">
                            Qty: {item.quantity} ·{" "}
                            {product?.category?.replace(/-/g, " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] font-bold text-neutral-900">
                            ₹
                            {(itemPrice * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                          {discount > 0 && (
                            <span className="text-[11px] text-neutral-400 line-through block mt-0.5">
                              ₹
                              {(originalPrice * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Details and Trigger */}
                <div className="p-5 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex-1">
                    <p className="text-[11px] text-neutral-500">
                      Order confirmation email will be sent to{" "}
                      <strong>{session?.user?.email}</strong>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>100% secure payments via Razorpay</span>
                    </p>
                  </div>
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isExpired || isProcessingPayment}
                      onClick={handleInitiatePayment}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#c4aaff] hover:from-primary/95 hover:to-[#c4aaff]/95 text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider min-w-[160px]"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay Now
                        </>
                      )}
                    </button>
                    {!defaultAddr && (
                      <p className="text-[10px] text-rose-500 font-medium mt-1 text-center sm:text-right">
                        * Add shipping address to checkout
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Summary & Pricing checkout ── */}
          <div className="w-full lg:w-[360px] shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
              {/* Header banner */}
              <div className="px-5 py-3.5 border-b border-neutral-100 bg-gradient-to-r from-primary/8 to-primary/2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest">
                  Price Details
                </h2>
              </div>

              {/* Price details line-items */}
              <div className="px-5 py-4 flex flex-col gap-3 text-left">
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Price ({items.length} items)</span>
                  <span>₹{totalMrp.toLocaleString("en-IN")}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>Discount</span>
                    <span className="text-green-600 font-medium">
                      − ₹{totalDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      Coupon
                      {appliedCouponCode && (
                        <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {appliedCouponCode}
                        </span>
                      )}
                    </span>
                    <span className="text-green-600 font-medium">
                      − ₹{couponDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                {/* Savings callout */}
                {totalSavings > 0 && (
                  <div className="text-green-700 font-medium text-[11px] bg-green-50 border border-green-100 px-3.5 py-2 rounded-lg flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-green-500" />
                    <span>
                      You save ₹{totalSavings.toLocaleString("en-IN")} on this
                      order!
                    </span>
                  </div>
                )}

                {/* grand amount */}
                <div className="flex justify-between items-center bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 mt-1">
                  <span className="text-xs font-bold text-neutral-700">
                    Total Amount
                  </span>
                  <span className="text-base font-extrabold text-primary">
                    ₹{finalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Required Modal */}
      {showAddressPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-7 border border-neutral-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 text-center">
            {/* Close button cross */}
            <button
              type="button"
              onClick={() => setShowAddressPopup(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing MapPin icon circle in brand primary */}
            <div className="w-14 h-14 rounded-full bg-[#f3edff] border border-[#ad8de9]/30 flex items-center justify-center text-primary mx-auto shadow-inner mt-2">
              <MapPin className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-800 tracking-tight font-serif">
                Delivery Address Required
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-[250px] mx-auto font-light">
                Please select a shipping address or add a new one in Step 1 to
                proceed with payment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddressPopup(false);
                // Delay slightly for smooth modal exit before scrolling
                setTimeout(() => {
                  document
                    .getElementById("address-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
              className="w-full py-3 bg-gradient-to-r from-primary to-[#926ee0] hover:shadow-lg hover:shadow-primary/20 text-white rounded-xl text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
            >
              OK, Select Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#faf9ff]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-neutral-500 text-sm">
              Loading checkout details…
            </p>
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
