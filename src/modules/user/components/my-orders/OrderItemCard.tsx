import { useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { OrderItemDisplay } from "./types";

const InvoiceTemplate = dynamic(() => import("./InvoiceTemplate"), {
  ssr: false,
});

interface OrderItemCardProps {
  displayItem: OrderItemDisplay;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({
  displayItem,
  isExpanded,
  onToggleExpand,
}) => {
  const submitReviewMutation = useMutation(api.reviews.submitReview);

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] =
    useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (displayItem.review) {
      setRating(displayItem.review.rating);
      setReviewText(displayItem.review.reviewText);
    } else {
      setRating(0);
      setReviewText("");
    }
  }, [displayItem.review]);

  const isSubmitted = !!displayItem.review;

  const handleSubmitReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rating === 0) {
      toast.error("Please select a rating star first.");
      return;
    }
    try {
      setIsSubmitting(true);
      await submitReviewMutation({
        productId: displayItem.item.productId as Id<"products">,
        orderId: displayItem.orderId as Id<"orders">,
        itemId: displayItem.itemId,
        rating,
        reviewText,
      });
      toast.success("Thank you! Your review has been submitted.", {
        description: `Rating: ${rating} Stars. Feedback: "${reviewText || "None"}"`,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit review. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateProductClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      onToggleExpand();
    }
    setTimeout(() => {
      const element = document.getElementById(
        `order-item-card-${displayItem.itemId}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.getElementById(
      `invoice-capture-${displayItem.itemId}`,
    );
    if (!element) {
      toast.error("Invoice template is still loading. Please try again.");
      return;
    }

    try {
      setIsDownloadingInvoice(true);

      // Load html2canvas and jspdf dynamically on demand
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.jsPDF;

      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas rendering returned empty dimensions");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 size width
      const canvasWidth = canvas.width || 794;
      const canvasHeight = canvas.height || 1123;
      const imgHeight = (canvasHeight * imgWidth) / canvasWidth;

      if (Number.isNaN(imgHeight) || imgHeight <= 0) {
        throw new Error("Invalid canvas heights calculated");
      }

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Generate Blob instead of base64 dataURL to bypass Chrome's size limit blocks
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice_Order_${displayItem.orderId.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the Object URL to free memory
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);

      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF invoice. Please try again.");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const formattedDate = new Date(displayItem.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case "placed":
        return {
          label: "Ordered & Preparing",
          color: "bg-[#ad8de9]",
          textColor: "text-[#ad8de9]",
          bgLight: "bg-[#ad8de9]/10",
          border: "border-[#ad8de9]/20",
          icon: <Package className="w-4 h-4" />,
          step: 1,
          detailMessage:
            "Your order is placed and confirmed. We are busy preparing your thoughtful gift!",
        };
      case "shipped":
        return {
          label: "On the way - Shipped",
          color: "bg-amber-500",
          textColor: "text-amber-600",
          bgLight: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: <Truck className="w-4 h-4" />,
          step: 2,
          detailMessage:
            "Your order has been shipped. The package is on its way to the delivery address.",
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          color: "bg-amber-500",
          textColor: "text-amber-600",
          bgLight: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: <Truck className="w-4 h-4" />,
          step: 3,
          detailMessage:
            "Your package is out for delivery with our local courier partner. It will reach you today!",
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-emerald-500",
          textColor: "text-emerald-600",
          bgLight: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: <CheckCircle2 className="w-4 h-4" />,
          step: 4,
          detailMessage: "Your item has been delivered successfully.",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-500",
          textColor: "text-red-600",
          bgLight: "bg-red-500/10",
          border: "border-red-500/20",
          icon: <XCircle className="w-4 h-4" />,
          step: 0,
          detailMessage:
            "This order was cancelled. A refund has been issued if applicable.",
        };
      default:
        return {
          label: status,
          color: "bg-neutral-400",
          textColor: "text-neutral-500",
          bgLight: "bg-neutral-100",
          border: "border-neutral-200",
          icon: <HelpCircle className="w-4 h-4" />,
          step: 0,
          detailMessage: "No delivery updates available.",
        };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] font-bold"
          >
            Failed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-neutral-100 text-neutral-500 border-neutral-200 text-[10px] font-bold"
          >
            {status}
          </Badge>
        );
    }
  };

  const statusInfo = getOrderStatusDisplay(displayItem.orderStatus);

  return (
    <div
      id={`order-item-card-${displayItem.itemId}`}
      className="overflow-hidden bg-white transition-all duration-300"
    >
      {/* Main Card Header */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Accordion header */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Toggles accordion view */}
      <div
        className="p-4 flex flex-row items-center gap-4 cursor-pointer select-none bg-white relative hover:bg-neutral-50/20"
        onClick={onToggleExpand}
      >
        {/* 1. Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-neutral-150 overflow-hidden shrink-0 bg-neutral-50 flex items-center justify-center">
          {/* biome-ignore lint/performance/noImgElement: Dynamic remote thumbnails must use HTML img to support arbitrary domains */}
          <img
            src={
              displayItem.item.thumbnail ||
              "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150&auto=format&fit=crop&q=60"
            }
            alt={displayItem.item.name}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. Content Info Panel */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 pr-4 sm:pr-0">
          {/* Product Name & Details */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <h4 className="text-sm font-semibold text-neutral-805 truncate sm:line-clamp-2 leading-snug pr-2">
              {displayItem.item.name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-400 font-medium">
              <span>Qty: {displayItem.item.quantity}</span>
              <span className="text-neutral-200/60">•</span>
              <span className="font-mono text-[10px] uppercase tracking-tight">
                Order: #{displayItem.orderId.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="md:w-24 shrink-0 font-bold text-sm text-neutral-805">
            ₹{displayItem.item.price.toLocaleString("en-IN")}
          </div>

          {/* Status Dot & Rate Link */}
          <div className="md:w-48 shrink-0 flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <span
                className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} shrink-0`}
              />
              <span>
                {displayItem.orderStatus === "delivered"
                  ? `Delivered on ${formattedDate}`
                  : statusInfo.label}
              </span>
            </div>

            {displayItem.orderStatus === "delivered" ? (
              <button
                type="button"
                onClick={handleRateProductClick}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Star size={11} className="fill-primary text-primary" />
                <span>Rate & Review Product</span>
              </button>
            ) : (
              <p className="text-[10px] text-neutral-400 pl-4">
                Placed on {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* Dropdown indicator */}
        <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto shrink-0 text-neutral-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detailed Expanded Accordion Panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-neutral-100 bg-[#faf9ff]/30"
          >
            <div className="p-5 space-y-6">
              {/* Green/Colored Tracker Box */}
              <div
                className={`p-4 rounded-lg border ${statusInfo.border} ${statusInfo.bgLight} space-y-2`}
              >
                <div
                  className={`text-xs font-bold ${statusInfo.textColor} flex items-center gap-2`}
                >
                  {statusInfo.icon}
                  <span>
                    {statusInfo.label} (Order Reference: #
                    {displayItem.orderId.slice(-12).toUpperCase()})
                  </span>
                </div>
                <div className="text-xs text-neutral-600 pl-6 leading-relaxed space-y-1.5">
                  <p>{statusInfo.detailMessage}</p>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              {displayItem.orderStatus !== "cancelled" ? (
                <div className="py-2 max-w-lg mx-auto">
                  <div className="relative flex justify-between items-start">
                    <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-neutral-200 z-0" />
                    <div
                      className="absolute top-[14px] left-0 h-0.5 bg-primary z-0 transition-all duration-500"
                      style={{
                        width:
                          statusInfo.step === 1
                            ? "0%"
                            : statusInfo.step === 2
                              ? "33.3%"
                              : statusInfo.step === 3
                                ? "66.6%"
                                : "100%",
                      }}
                    />

                    {[
                      {
                        step: 1,
                        label: "Order Placed",
                        icon: <Package className="w-3.5 h-3.5" />,
                        date: new Date(
                          displayItem.createdAt,
                        ).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }),
                      },
                      {
                        step: 2,
                        label: "Shipped",
                        icon: <Truck className="w-3.5 h-3.5" />,
                        date:
                          statusInfo.step >= 2
                            ? new Date(
                                displayItem.shippedAt ||
                                  displayItem.createdAt +
                                    1 * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })
                            : undefined,
                      },
                      {
                        step: 3,
                        label: "Out for Delivery",
                        icon: <Truck className="w-3.5 h-3.5" />,
                        date:
                          statusInfo.step >= 3
                            ? new Date(
                                displayItem.outForDeliveryAt ||
                                  displayItem.createdAt +
                                    2 * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })
                            : undefined,
                      },
                      {
                        step: 4,
                        label: "Delivered",
                        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                        date:
                          statusInfo.step >= 4
                            ? new Date(
                                displayItem.deliveredAt ||
                                  displayItem.createdAt +
                                    3 * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })
                            : undefined,
                      },
                    ].map((s) => {
                      const isActive = s.step <= statusInfo.step;
                      return (
                        <div
                          key={s.step}
                          className="flex flex-col items-center gap-1.5 relative z-10 w-24 text-center"
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              isActive
                                ? "bg-primary border-primary text-white shadow"
                                : "bg-white border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {s.icon}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isActive ? "text-neutral-805" : "text-neutral-400"
                            }`}
                          >
                            {s.label}
                          </span>
                          {s.date && (
                            <span className="text-[9px] text-neutral-400 font-medium whitespace-nowrap">
                              {s.date}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 p-4 rounded-lg max-w-md mx-auto">
                  <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-neutral-750">
                      Order Terminated
                    </p>
                    <p className="text-neutral-500 mt-0.5">
                      This order is cancelled and cannot be tracked further.
                    </p>
                  </div>
                </div>
              )}

              {/* Details Grid (Shipping & Payment) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Destination */}
                <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-2xs space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Shipping Destination
                  </h4>
                  {displayItem.address ? (
                    <div className="text-xs text-neutral-600 space-y-1.5 pl-1">
                      <p className="font-bold text-neutral-800">
                        {displayItem.address.fullName}
                      </p>
                      <p className="text-neutral-550 leading-normal">
                        {displayItem.address.address}
                      </p>
                      <p className="text-neutral-500">
                        {displayItem.address.locality &&
                          `${displayItem.address.locality}, `}
                        {displayItem.address.city}, {displayItem.address.state}{" "}
                        - {displayItem.address.pincode}
                      </p>
                      <p className="text-neutral-400 font-mono text-[10px] pt-1">
                        Contact: {displayItem.address.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic pl-1">
                      No address linked.
                    </p>
                  )}
                </div>

                {/* Payment Details */}
                <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-2xs space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    Payment Details
                  </h4>
                  <div className="text-xs space-y-2 pl-1">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Gateway Status:</span>
                      <span>
                        {getPaymentStatusBadge(displayItem.paymentStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Method:</span>
                      <span className="text-neutral-600 font-semibold">
                        Razorpay Online Banking
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">
                        Full Order Amount:
                      </span>
                      <span className="text-primary font-bold">
                        ₹{displayItem.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Your Experience (only for delivered orders) */}
              {displayItem.orderStatus === "delivered" && (
                <div className="bg-neutral-50/70 rounded-xl p-5 border border-neutral-100 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-800">
                    Rate your experience
                  </h4>

                  {!isSubmitted ? (
                    <div className="space-y-4">
                      {/* Product Row */}
                      <div className="bg-white p-4 rounded-xl border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-[#ad8de9]/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-neutral-700">
                            Rate the product
                          </span>
                        </div>

                        {/* 5 Stars */}
                        <div className="flex items-center gap-1.5 select-none">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= (hoveredRating || rating);
                            return (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRating(star);
                                }}
                                className="transition-transform duration-150 hover:scale-120 focus:outline-none"
                              >
                                <Star
                                  size={24}
                                  className={`transition-colors duration-200 cursor-pointer ${
                                    isFilled
                                      ? "fill-primary text-primary"
                                      : "text-neutral-300"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Review Textarea (Only appears once rating is selected) */}
                      {rating > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isSubmitting}
                            placeholder="Write your review here (optional)..."
                            className="w-full text-xs p-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-h-[90px] bg-white resize-none disabled:opacity-60"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={handleSubmitReview}
                              disabled={isSubmitting}
                              className="rounded-full text-xs font-bold bg-primary hover:bg-primary/95 text-white px-6 py-2 transition-all shadow-sm disabled:opacity-60"
                            >
                              {isSubmitting ? "Submitting..." : "Submit Review"}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-xl border border-neutral-100 flex flex-col items-center text-center space-y-3 shadow-2xs">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={20} className="fill-emerald-50" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-800">
                          Review Submitted!
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= rating
                                  ? "fill-primary text-primary"
                                  : "text-neutral-200"
                              }
                            />
                          ))}
                        </div>
                        {reviewText && (
                          <p className="text-xs text-neutral-500 italic max-w-sm mx-auto mt-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                            "{reviewText}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Panel Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3.5 border-t border-neutral-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold text-neutral-500 border-neutral-200 bg-white hover:bg-neutral-50 hover:text-neutral-800 transition-all cursor-pointer font-sans disabled:opacity-60"
                  disabled={isDownloadingInvoice}
                  onClick={handleDownloadInvoice}
                >
                  {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full text-xs font-bold bg-primary hover:bg-primary/95 text-white transition-all shadow-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success("Support ticket created.", {
                      description: `Our support team has been notified regarding Order ID #${displayItem.orderId.slice(-8).toUpperCase()}.`,
                    });
                  }}
                >
                  Need Help?
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Off-screen Printable Invoice Container */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <InvoiceTemplate displayItem={displayItem} />,
          document.body,
        )}
    </div>
  );
};

export default OrderItemCard;
