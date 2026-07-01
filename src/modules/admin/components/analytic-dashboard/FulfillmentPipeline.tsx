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
import {
  formatCurrency,
  STATUS_COLORS,
  STATUS_LABELS,
  TOOLTIP_STYLE,
} from "./dashboard-utils";

interface FulfillmentPipelineProps {
  orderStatusBreakdown: { status: string; count: number; revenue: number }[];
}

export function FulfillmentPipeline({
  orderStatusBreakdown,
}: FulfillmentPipelineProps) {
  const pipelineData = orderStatusBreakdown.map((item) => ({
    ...item,
    label: STATUS_LABELS[item.status] ?? item.status,
  }));
  const hasData = pipelineData.some((i) => i.count > 0);

  return (
    <ChartCard title="Fulfillment Pipeline" subtitle="Order volume by stage.">
      <div className="h-[200px] sm:h-[240px] w-full relative">
        {!hasData && <EmptyState message="Pipeline fills as orders arrive." />}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={pipelineData}
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
                name === "revenue" ? formatCurrency(val) : String(val),
                name === "revenue" ? "Revenue" : "Orders",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {pipelineData.map((entry, i) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[i % STATUS_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
