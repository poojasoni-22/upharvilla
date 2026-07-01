"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import { CATEGORY_LABELS, TOOLTIP_STYLE } from "./dashboard-utils";

interface InventoryHealthProps {
  inventoryByCategory: {
    category: string;
    totalProducts: number;
    healthy: number;
    lowStock: number;
    outOfStock: number;
    stockUnits: number;
  }[];
}

export function InventoryHealth({ inventoryByCategory }: InventoryHealthProps) {
  const chartData = inventoryByCategory.map((item) => ({
    ...item,
    label: CATEGORY_LABELS[item.category] ?? item.category,
  }));
  const hasData = chartData.some(
    (i) => i.healthy > 0 || i.lowStock > 0 || i.outOfStock > 0,
  );

  return (
    <ChartCard title="Inventory Health" subtitle="Stock levels by category.">
      <div className="h-[200px] sm:h-[240px] w-full relative">
        {!hasData && (
          <EmptyState message="Stock health appears after products are active." />
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="label"
              stroke="#d4d4d4"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={0}
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
                name === "outOfStock"
                  ? "Out of stock"
                  : name === "lowStock"
                    ? "Low stock"
                    : "Healthy",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend
              verticalAlign="top"
              height={24}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 10, color: "#737373" }}
            />
            <Bar
              dataKey="healthy"
              stackId="inv"
              fill="#10b981"
              name="Healthy"
            />
            <Bar
              dataKey="lowStock"
              stackId="inv"
              fill="#f59e0b"
              name="Low stock"
            />
            <Bar
              dataKey="outOfStock"
              stackId="inv"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              name="Out of stock"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
