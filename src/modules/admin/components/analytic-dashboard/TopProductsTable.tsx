"use client";

import { ChartCard, EmptyState } from "./ChartCard";
import { formatCompactCurrency } from "./dashboard-utils";

interface TopProductsTableProps {
  topProducts: { name: string; quantity: number; revenue: number }[];
}

const RANK_STYLES = [
  "bg-primary/10 text-primary",
  "bg-indigo-50 text-indigo-500",
  "bg-teal-50 text-teal-500",
];

export function TopProductsTable({ topProducts }: TopProductsTableProps) {
  const hasData = topProducts.some((i) => i.revenue > 0);
  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <ChartCard title="Top Products" subtitle="Best revenue drivers.">
      <div className="w-full relative">
        {!hasData && (
          <EmptyState message="Top products appear after paid orders." />
        )}
        {hasData && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 pr-2 font-sans">
                    #
                  </th>
                  <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 pr-2 font-sans">
                    Product
                  </th>
                  <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 pr-2 font-sans text-right">
                    Qty
                  </th>
                  <th className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider py-2.5 font-sans text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {topProducts.map((product, i) => {
                  const barWidth = Math.round(
                    (product.revenue / maxRevenue) * 100,
                  );
                  return (
                    <tr
                      key={product.name}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-bold font-mono ${
                            RANK_STYLES[i] ?? "bg-neutral-50 text-neutral-400"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-800 truncate max-w-[140px] font-sans">
                            {product.name}
                          </p>
                          <div className="mt-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className="text-[11px] font-semibold text-neutral-500 font-mono tabular-nums">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-xs font-bold text-neutral-800 font-mono tabular-nums">
                          {formatCompactCurrency(product.revenue)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
