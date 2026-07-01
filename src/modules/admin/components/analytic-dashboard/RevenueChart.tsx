"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState, RangeToggle } from "./ChartCard";
import { formatCurrency, TOOLTIP_STYLE } from "./dashboard-utils";

interface RevenueChartProps {
  revenueRange: string;
  onRangeChange: (v: string) => void;
  chartData: { label: string; revenue: number; orders: number }[];
}

const RANGE_OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "6 months", value: "6m" },
];

export function RevenueChart({
  revenueRange,
  onRangeChange,
  chartData,
}: RevenueChartProps) {
  const hasData = chartData.some((d) => d.revenue > 0 || d.orders > 0);

  return (
    <ChartCard
      title="Revenue & Orders"
      subtitle="Track revenue alongside order volume."
      right={
        <RangeToggle
          options={RANGE_OPTIONS}
          value={revenueRange}
          onChange={onRangeChange}
        />
      }
    >
      <div className="h-[200px] sm:h-[280px] w-full relative">
        {!hasData && (
          <EmptyState message="Revenue timeline will appear after orders are paid." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ad8de9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ad8de9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="label"
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [
                name === "revenue" ? formatCurrency(val) : String(val),
                name === "revenue" ? "Revenue" : "Orders",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#ad8de9"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#6366f1"
              strokeWidth={1.5}
              dot={{ r: 2.5, fill: "#6366f1" }}
              name="orders"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
