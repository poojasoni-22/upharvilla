"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { formatCompactCurrency } from "./dashboard-utils";

interface KPICardsProps {
  totalRevenue: number;
  totalOrdersCount: number;
  overallAOV: number;
  enquiriesCount: number;
  lowStockCount: number;
  revenueGrowthPercent: number;
}

export function KPICards({
  totalRevenue,
  totalOrdersCount,
  overallAOV,
  enquiriesCount,
  lowStockCount,
  revenueGrowthPercent,
}: KPICardsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatCompactCurrency(totalRevenue),
      icon: <IndianRupee className="w-4 h-4" />,
      sub:
        revenueGrowthPercent !== 0 ? (
          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 mt-1 ${revenueGrowthPercent >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {revenueGrowthPercent >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(revenueGrowthPercent)}% vs last 30d
          </span>
        ) : null,
    },
    {
      label: "Total Orders",
      value: totalOrdersCount,
      sub: (
        <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
          All placed orders
        </span>
      ),
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      label: "Avg. Order Value",
      value: formatCompactCurrency(overallAOV),
      sub: (
        <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
          Per paid order
        </span>
      ),
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      label: "Enquiries",
      value: enquiriesCount,
      sub: (
        <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
          Feedback & queries
        </span>
      ),
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      sub: (
        <span
          className={`text-[10px] font-medium mt-1 block ${lowStockCount > 0 ? "text-rose-500" : "text-neutral-400"}`}
        >
          {lowStockCount > 0 ? "Action required" : "All healthy"}
        </span>
      ),
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in duration-300">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
              {card.label}
            </p>
            <div className="w-8 h-8 rounded-lg bg-neutral-50 text-primary flex items-center justify-center">
              {card.icon}
            </div>
          </div>
          <p className="text-lg font-extrabold text-neutral-800 font-mono">
            {card.value}
          </p>
          {card.sub}
        </div>
      ))}
    </div>
  );
}
