"use client";

import { useQuery } from "convex/react";
import {
  Calendar,
  ChevronRight,
  Hash,
  Loader2,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { OrderItemCard } from "@/modules/user/components/my-orders/OrderItemCard";
import { OrdersSearchBar } from "@/modules/user/components/my-orders/OrdersSearchBar";
import { api } from "../../../../convex/_generated/api";

/* ─── helpers ─── */

const _STATUS_ORDER: Record<string, number> = {
  placed: 0,
  shipped: 1,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: 4,
};

const STATUS_BADGE: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  placed: {
    label: "Processing",
    dot: "bg-[#ad8de9]",
    text: "text-[#ad8de9]",
    bg: "bg-[#ad8de9]/8",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    dot: "bg-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-500",
    text: "text-red-600",
    bg: "bg-red-50",
  },
};

const formatOrderDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function UserOrdersPage() {
  const { data: session, isPending } = authClient.useSession();
  const orders = useQuery(api.orders.listUserOrders);

  const displayOrders = useMemo(() => orders || [], [orders]);

  /* ── search state ── */
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ── filter state ── */
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  /* ── expand state ── */
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const toggleExpand = (cardId: string) =>
    setExpandedCardId((prev) => (prev === cardId ? null : cardId));

  /* ── flatten for search-bar suggestions + item filtering ── */
  const allOrderItems = useMemo(() => {
    if (!displayOrders) return [];
    return displayOrders.flatMap((order) => {
      const orderReviews = (order as any).reviews || [];
      return order.items.map((item: any, idx: number) => {
        const itemId = `${order._id}-${item.productId}-${idx}`;
        const itemReview = orderReviews.find((r: any) => r.itemId === itemId);
        return {
          orderId: order._id as any,
          itemId,
          item: item as any,
          orderItems: order.items as any,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus as any,
          paymentStatus: order.paymentStatus as any,
          razorpayOrderId: order.razorpayOrderId,
          address: order.address as any,
          shippedAt: (order as any).shippedAt,
          outForDeliveryAt: (order as any).outForDeliveryAt,
          deliveredAt: (order as any).deliveredAt,
          review: itemReview || null,
        };
      });
    });
  }, [displayOrders]);

  /* ── open-review query param ── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const openReviewId = params.get("openReview");
      if (openReviewId) {
        setExpandedCardId(openReviewId);
        setTimeout(() => {
          const element = document.getElementById(
            `order-item-card-${openReviewId}`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    }
  }, []);

  /* ── item-level filtering (search + sidebar filters) ── */
  const filteredItemIds = useMemo(() => {
    const term = activeSearch.toLowerCase().trim();

    const result = allOrderItems.filter((item) => {
      // 1. Search
      if (term) {
        const matchesName = item.item.name.toLowerCase().includes(term);
        const matchesId = item.orderId.toLowerCase().includes(term);
        if (!matchesName && !matchesId) return false;
      }

      // 2. Status
      if (selectedStatuses.length > 0) {
        const matchesStatus = selectedStatuses.some((status) => {
          if (status === "on_the_way")
            return (
              item.orderStatus === "placed" || item.orderStatus === "shipped"
            );
          return item.orderStatus === status;
        });
        if (!matchesStatus) return false;
      }

      // 3. Time
      if (selectedTimes.length > 0) {
        const orderDate = new Date(item.createdAt);
        const orderYear = orderDate.getFullYear().toString();
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const matchesTime = selectedTimes.some((time) => {
          if (time === "last_30_days") return item.createdAt >= thirtyDaysAgo;
          if (time === "2026") return orderYear === "2026";
          if (time === "2025") return orderYear === "2025";
          if (time === "older") return parseInt(orderYear, 10) < 2025;
          return false;
        });
        if (!matchesTime) return false;
      }

      return true;
    });

    return new Set(result.map((r) => r.itemId));
  }, [allOrderItems, activeSearch, selectedStatuses, selectedTimes]);

  /* ── build order-grouped data (only orders with matching items) ── */
  const groupedOrders = useMemo(() => {
    return displayOrders
      .map((order) => {
        const orderReviews = (order as any).reviews || [];
        const items = order.items
          .map((item: any, idx: number) => {
            const itemId = `${order._id}-${item.productId}-${idx}`;
            const itemReview = orderReviews.find(
              (r: any) => r.itemId === itemId,
            );
            return {
              orderId: order._id as any,
              itemId,
              item: item as any,
              orderItems: order.items as any,
              totalAmount: order.totalAmount,
              createdAt: order.createdAt,
              orderStatus: order.orderStatus as any,
              paymentStatus: order.paymentStatus as any,
              razorpayOrderId: order.razorpayOrderId,
              address: order.address as any,
              shippedAt: (order as any).shippedAt,
              outForDeliveryAt: (order as any).outForDeliveryAt,
              deliveredAt: (order as any).deliveredAt,
              review: itemReview || null,
            };
          })
          .filter((it: any) => filteredItemIds.has(it.itemId));

        if (items.length === 0) return null;

        return {
          orderId: order._id as string,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus as string,
          paymentStatus: order.paymentStatus as string,
          itemCount: order.items.length,
          items,
        };
      })
      .filter(Boolean) as {
      orderId: string;
      createdAt: number;
      totalAmount: number;
      orderStatus: string;
      paymentStatus: string;
      itemCount: number;
      items: any[];
    }[];
  }, [displayOrders, filteredItemIds]);

  /* ── handlers ── */
  const handleStatusFilterChange = (status: string) =>
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );

  const handleTimeFilterChange = (time: string) =>
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTimes([]);
    setSearchInput("");
    setActiveSearch("");
  };

  const hasFilters =
    selectedStatuses.length > 0 ||
    selectedTimes.length > 0 ||
    activeSearch !== "";

  /* ── loading ── */
  if (isPending || orders === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[65vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  /* ── unauthenticated ── */
  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[65vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-150 animate-pulse" />
          <ShoppingBag className="w-20 h-20 text-primary relative z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-serif">
            Sign In to View Orders
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto font-sans text-sm tracking-wide">
            Please log in to track your deliveries, view invoices, and manage
            order history.
          </p>
        </div>
        <Link href="/auth">
          <Button
            size="lg"
            className="rounded-full px-8 mt-4 bg-primary hover:bg-primary/95 text-white shadow-md hover:shadow-lg transition-all"
          >
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  /* ── main ── */
  return (
    <div className="flex-1 bg-[#faf9ff] min-h-screen py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 px-1 select-none font-mono">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={10} className="text-neutral-400" />
          <Link
            href="/account"
            className="hover:text-primary transition-colors"
          >
            My Account
          </Link>
          <ChevronRight size={10} className="text-neutral-400" />
          <span className="text-neutral-800 font-semibold cursor-default">
            My Orders
          </span>
        </div>

        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800">My Orders</h1>
          {orders && orders.length > 0 && (
            <span className="inline-flex items-center justify-center bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          )}
        </div>

        {/* Inline Filters + Search */}
        <div className="flex flex-col gap-4">
          {/* ── Filter Pills ── */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            {[
              { value: "on_the_way", label: "On the way" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "returned", label: "Returned" },
            ].map((status) => {
              const isActive = selectedStatuses.includes(status.value);
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleStatusFilterChange(status.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {status.label}
                  {isActive && <X size={12} className="ml-0.5" />}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-neutral-200 mx-1 hidden sm:block" />

            {/* Time pills */}
            {[
              { value: "last_30_days", label: "Last 30 days" },
              { value: "2026", label: "2026" },
              { value: "2025", label: "2025" },
              { value: "older", label: "Older" },
            ].map((time) => {
              const isActive = selectedTimes.includes(time.value);
              return (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => handleTimeFilterChange(time.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {time.label}
                  {isActive && <X size={12} className="ml-0.5" />}
                </button>
              );
            })}

            {/* Clear all */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-primary hover:underline ml-2 cursor-pointer transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* ── Search Bar ── */}
          <OrdersSearchBar
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            allOrderItems={allOrderItems}
            onSelectSuggestion={(itemId) => {
              const item = allOrderItems.find((x) => x.itemId === itemId);
              if (item) {
                setSearchInput(item.item.name);
                setActiveSearch(item.item.name);
              }

              setExpandedCardId(itemId);
              setTimeout(() => {
                const el = document.getElementById(`order-item-card-${itemId}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 200);
            }}
          />

          {/* Orders List — grouped by order */}
          {allOrderItems.length === 0 ? (
            /* No orders at all */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
              <div className="p-4 bg-[#ad8de9]/10 rounded-full">
                <ShoppingBag className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold font-serif text-neutral-800">
                  No Orders Found
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  You haven&apos;t placed any orders yet. Start exploring our
                  beautiful collections!
                </p>
              </div>
              <Link href="/products">
                <Button className="rounded-full px-8 bg-primary hover:bg-primary/95 text-white transition-all shadow-sm">
                  Shop Now
                </Button>
              </Link>
            </div>
          ) : groupedOrders.length === 0 ? (
            /* No results after filtering */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
              <div className="p-4 bg-[#ad8de9]/10 rounded-full">
                <ShoppingBag className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold font-serif text-neutral-800">
                  No Orders Matching Filters
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Try checking different filters or clearing the search text to
                  find what you are looking for.
                </p>
              </div>
              <Button
                onClick={clearFilters}
                className="rounded-full px-8 bg-primary hover:bg-primary/95 text-white transition-all shadow-sm"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            /* Grouped order cards */
            <div className="space-y-5">
              {groupedOrders.map((order) => {
                const badge =
                  STATUS_BADGE[order.orderStatus] ?? STATUS_BADGE.placed;
                return (
                  <section
                    key={order.orderId}
                    className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
                  >
                    {/* ── Order Header ── */}
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5 bg-neutral-50/60 border-b border-neutral-100">
                      {/* Left: date + id */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Calendar size={13} className="text-neutral-400" />
                          <span className="font-medium">
                            {formatOrderDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Hash size={12} className="text-neutral-300" />
                          <span className="font-mono text-[11px] uppercase tracking-tight">
                            {order.orderId.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Package size={12} className="text-neutral-300" />
                          <span className="font-medium">
                            {order.itemCount}{" "}
                            {order.itemCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>

                      {/* Right: total + status */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-neutral-800 font-mono">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                          />
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* ── Item Cards ── */}
                    <div className="divide-y divide-neutral-100">
                      {order.items.map((displayItem: any) => (
                        <OrderItemCard
                          key={displayItem.itemId}
                          displayItem={displayItem}
                          isExpanded={expandedCardId === displayItem.itemId}
                          onToggleExpand={() =>
                            toggleExpand(displayItem.itemId)
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
