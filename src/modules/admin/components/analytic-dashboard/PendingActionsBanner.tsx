"use client";

import {
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface PendingActionsProps {
  pendingOrders: number;
  outOfStockCount: number;
  lowStockCount: number;
  enquiriesCount: number;
}

export function PendingActionsBanner({
  pendingOrders,
  outOfStockCount,
  lowStockCount,
  enquiriesCount,
}: PendingActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Check if content overflows (needs scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth + 4);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOverflowing || isPaused) return;

    let animId: number;
    let direction = 1;
    const speed = 0.5; // px per frame

    const step = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollLeft += speed * direction;

      // Reverse direction at edges
      if (el.scrollLeft >= maxScroll - 1) direction = -1;
      if (el.scrollLeft <= 0) direction = 1;

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isOverflowing, isPaused]);

  const handleInteraction = useCallback(() => {
    setIsPaused(true);
    // Resume auto-scroll after 4s of no interaction
    const timer = setTimeout(() => setIsPaused(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const alerts = [
    pendingOrders > 0 && {
      icon: <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: `${pendingOrders} order${pendingOrders > 1 ? "s" : ""} to ship`,
      textColor: "text-amber-600",
      href: "/admin/orders",
    },
    outOfStockCount > 0 && {
      icon: <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: `${outOfStockCount} out of stock`,
      textColor: "text-rose-600",
      href: "/admin/inventory",
    },
    lowStockCount > 0 && {
      icon: <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: `${lowStockCount} low stock`,
      textColor: "text-orange-600",
      href: "/admin/inventory",
    },
    enquiriesCount > 0 && {
      icon: <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: `${enquiriesCount} enquir${enquiriesCount > 1 ? "ies" : "y"}`,
      textColor: "text-indigo-600",
      href: "/admin/enquiries",
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    textColor: string;
    href: string;
  }[];

  const quickActions = [
    {
      label: "Add Product",
      icon: <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      href: "/admin/inventory",
    },
    {
      label: "Pending Orders",
      icon: <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      href: "/admin/orders",
    },
    {
      label: "Create Coupon",
      icon: <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      href: "/admin/coupons",
    },
    {
      label: "View Enquiries",
      icon: <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      href: "/admin/enquiries",
    },
  ];

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleInteraction}
      onMouseDown={handleInteraction}
      className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 animate-in fade-in duration-300"
    >
      {/* Alert pills */}
      {alerts.length > 0 && (
        <>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
            Alerts
          </span>
          {alerts.map((alert, i) => (
            <Link
              key={`alert-${i}`}
              href={alert.href}
              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold border border-primary/20 bg-white/80 transition-all hover:border-primary/40 hover:shadow-sm shrink-0 ${alert.textColor}`}
            >
              {alert.icon}
              {alert.label}
              <ArrowRight className="w-2.5 h-2.5 opacity-30" />
            </Link>
          ))}
          <span className="w-px h-4 bg-neutral-200 shrink-0 mx-0.5" />
        </>
      )}

      {/* Quick action pills */}
      {quickActions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white border border-primary/25 text-neutral-600 hover:border-primary/50 hover:text-primary hover:shadow-sm transition-all shrink-0"
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}
