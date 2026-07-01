"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import {
  CATEGORY_LABELS,
  DONUT_COLORS,
  formatCurrency,
  TOOLTIP_STYLE,
} from "./dashboard-utils";

interface CategoryRevenueChartProps {
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
}

export function CategoryRevenueChart({
  revenueByCategory,
}: CategoryRevenueChartProps) {
  const donutData = revenueByCategory.map((c) => ({
    ...c,
    label: CATEGORY_LABELS[c.category] ?? c.category,
  }));
  const hasData = donutData.some((d) => d.revenue > 0);

  return (
    <ChartCard
      title="Revenue by Category"
      subtitle="Revenue split across product categories."
    >
      <div className="h-[220px] sm:h-[260px] w-full relative">
        {!hasData && (
          <EmptyState message="Category breakdown appears after paid orders." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={82}
              paddingAngle={3}
              dataKey="revenue"
              nameKey="label"
              stroke="none"
            >
              {donutData.map((_e, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: unknown) => [formatCurrency(val), "Revenue"]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 10, color: "#737373" }}
              formatter={(value: string) => (
                <span className="text-neutral-500 text-[10px]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
