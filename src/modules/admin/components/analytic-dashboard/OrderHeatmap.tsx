"use client";

import { ChartCard, EmptyState } from "./ChartCard";

interface OrderHeatmapProps {
  heatmapData: { hour: number; dayOfWeek: string; count: number }[];
}

export function OrderHeatmap({ heatmapData }: OrderHeatmapProps) {
  const hasData = heatmapData.some((h) => h.count > 0);
  const heatmapMax = Math.max(...heatmapData.map((h) => h.count), 1);

  return (
    <ChartCard
      title="Order Heatmap"
      subtitle="Peak shopping hours (last 30 days)."
      className="xl:col-span-2"
    >
      <div className="relative">
        {!hasData && (
          <EmptyState message="Heatmap populates as orders come in." />
        )}
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Hour labels */}
            <div className="flex ml-9 mb-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={`h-${i}`}
                  className="flex-1 text-center text-[8px] text-neutral-400"
                >
                  {i % 3 === 0 ? `${i}h` : ""}
                </div>
              ))}
            </div>

            {/* Day rows */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="flex items-center gap-1 mb-[2px]">
                <span className="w-8 text-[9px] font-medium text-neutral-500 text-right pr-1 shrink-0">
                  {day}
                </span>
                <div className="flex flex-1 gap-[1.5px]">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = heatmapData.find(
                      (h) => h.dayOfWeek === day && h.hour === hour,
                    );
                    const count = cell?.count ?? 0;
                    const intensity = heatmapMax > 0 ? count / heatmapMax : 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="flex-1 aspect-square rounded-[2px]"
                        style={{
                          backgroundColor:
                            count === 0
                              ? "#faf8ff"
                              : `rgba(173, 141, 233, ${0.12 + intensity * 0.88})`,
                        }}
                        title={`${day} ${hour}:00 — ${count} order${count !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-2 mr-1">
              <span className="text-[9px] text-neutral-400">Less</span>
              <div className="flex gap-[1px]">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((i) => (
                  <div
                    key={`leg-${i}`}
                    className="w-2.5 h-2.5 rounded-[2px]"
                    style={{
                      backgroundColor:
                        i === 0
                          ? "#faf8ff"
                          : `rgba(173, 141, 233, ${0.12 + i * 0.88})`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-neutral-400">More</span>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
