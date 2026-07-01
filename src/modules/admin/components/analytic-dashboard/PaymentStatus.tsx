"use client";

import { ChartCard, EmptyState } from "./ChartCard";
import { PAYMENT_STATUS_COLORS } from "./dashboard-utils";

interface PaymentStatusProps {
  paymentStatusBreakdown: { status: string; count: number }[];
}

export function PaymentStatus({ paymentStatusBreakdown }: PaymentStatusProps) {
  const hasData = paymentStatusBreakdown.length > 0;

  return (
    <ChartCard
      title="Payment Status"
      subtitle="Breakdown of all order payments."
    >
      <div className="h-[200px] sm:h-[220px] w-full relative flex flex-col justify-center gap-4 px-1">
        {!hasData && (
          <EmptyState message="Payment status appears after first order." />
        )}
        {paymentStatusBreakdown.map((item) => {
          const total = paymentStatusBreakdown.reduce((s, i) => s + i.count, 0);
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = PAYMENT_STATUS_COLORS[item.status] ?? "#9ca3af";
          return (
            <div key={item.status} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-neutral-600 capitalize">
                    {item.status}
                  </span>
                </div>
                <span className="text-xs font-bold text-neutral-800 font-mono tabular-nums">
                  {item.count}{" "}
                  <span className="text-neutral-400 font-normal text-[10px]">
                    ({pct}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
