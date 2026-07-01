"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import { formatCurrency, TOOLTIP_STYLE } from "./dashboard-utils";

interface AOVTrendChartProps {
  aovWeekly: { week: string; aov: number; orders: number }[];
  overallAOV: number;
}

export function AOVTrendChart({ aovWeekly, overallAOV }: AOVTrendChartProps) {
  const hasData = aovWeekly.some((w) => w.aov > 0);

  return (
    <ChartCard
      title="Avg. Order Value"
      subtitle="Weekly AOV trend (last 30 days)."
    >
      <div className="h-[200px] sm:h-[220px] w-full relative">
        {!hasData && (
          <EmptyState message="AOV trend appears after paid orders." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={aovWeekly}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="week"
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [
                name === "aov" ? formatCurrency(val) : String(val),
                name === "aov" ? "AOV" : "Orders",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="aov"
              fill="#ad8de9"
              radius={[6, 6, 0, 0]}
              opacity={0.3}
              name="aov"
            />
            <Line
              type="monotone"
              dataKey="aov"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#6366f1",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="aov"
            />
            {overallAOV > 0 && (
              <Line
                type="monotone"
                dataKey={() => overallAOV}
                stroke="#e5e5e5"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="benchmark"
                legendType="none"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
