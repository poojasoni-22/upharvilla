"use client";

import { Clock, MessageSquare, Package, ShoppingBag, Star } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { timeAgo } from "./dashboard-utils";

interface RecentActivityProps {
  recentActivity: { type: string; description: string; time: number }[];
}

const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string }> = {
  order: {
    icon: <ShoppingBag className="w-3.5 h-3.5 text-[#ad8de9]" />,
    bg: "bg-[#ad8de9]/10",
  },
  enquiry: {
    icon: <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />,
    bg: "bg-indigo-50",
  },
  review: {
    icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
    bg: "bg-amber-50",
  },
};

const DEFAULT_ICON = {
  icon: <Package className="w-3.5 h-3.5 text-neutral-400" />,
  bg: "bg-neutral-50",
};

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
    <ChartCard
      title="Recent Activity"
      subtitle="Latest orders, enquiries, and reviews."
    >
      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-neutral-400">
            No recent activity to display.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {recentActivity.map((item, index) => {
            const cfg = ICON_MAP[item.type] ?? DEFAULT_ICON;
            return (
              <div
                key={`act-${index}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-700 leading-snug line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-neutral-300" />
                    <span className="text-[10px] text-neutral-400">
                      {timeAgo(item.time)}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                  {item.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
