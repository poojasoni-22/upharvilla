"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import { DONUT_COLORS, formatCurrency, TOOLTIP_STYLE } from "./dashboard-utils";

interface CouponPerformanceProps {
  couponPerformance: {
    code: string;
    redemptions: number;
    totalDiscount: number;
  }[];
}

export function CouponPerformance({
  couponPerformance,
}: CouponPerformanceProps) {
  const hasData = couponPerformance.some((c) => c.redemptions > 0);

  return (
    <ChartCard
      title="Coupon Performance"
      subtitle="Top coupons by redemptions."
    >
      <div className="h-[200px] sm:h-[220px] w-full relative">
        {!hasData && (
          <EmptyState message="Coupon analytics appear after first redemption." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={couponPerformance}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f3f4f6"
            />
            <XAxis
              type="number"
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="code"
              width={72}
              stroke="#d4d4d4"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [
                name === "totalDiscount" ? formatCurrency(val) : String(val),
                name === "totalDiscount" ? "Total Discount" : "Redemptions",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="redemptions"
              fill="#ad8de9"
              radius={[0, 6, 6, 0]}
              name="redemptions"
            >
              {couponPerformance.map((_e, i) => (
                <Cell
                  key={`coupon-${i}`}
                  fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
