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
import { TOOLTIP_STYLE } from "./dashboard-utils";

interface DailyVolumeChartProps {
  dailyOrderVolume: { date: string; count: number; revenue: number }[];
}

export function DailyVolumeChart({ dailyOrderVolume }: DailyVolumeChartProps) {
  const hasData = dailyOrderVolume.some((d) => d.count > 0);

  return (
    <ChartCard
      title="Daily Order Volume"
      subtitle="Orders per day (last 30 days)."
    >
      <div className="h-[220px] sm:h-[260px] w-full relative">
        {!hasData && (
          <EmptyState message="Daily volume appears as orders come in." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={dailyOrderVolume}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="date"
              stroke="#d4d4d4"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              stroke="#d4d4d4"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [
                String(val),
                name === "count" ? "Orders" : "Trend",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="count"
              fill="#ad8de9"
              radius={[3, 3, 0, 0]}
              opacity={0.5}
              name="count"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={1.5}
              dot={false}
              name="trend"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
