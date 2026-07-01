"use client";

import { Star } from "lucide-react";
import { ChartCard, EmptyState } from "./ChartCard";
import { RATING_COLORS } from "./dashboard-utils";

interface ReviewRatingsProps {
  ratingDistribution: { rating: number; count: number }[];
  totalReviews: number;
}

export function ReviewRatings({
  ratingDistribution,
  totalReviews,
}: ReviewRatingsProps) {
  const hasData = ratingDistribution.some((r) => r.count > 0);

  return (
    <ChartCard
      title="Review Ratings"
      subtitle={`${totalReviews} total review${totalReviews !== 1 ? "s" : ""}.`}
    >
      <div className="h-[200px] sm:h-[220px] w-full relative">
        {!hasData && (
          <EmptyState message="Ratings appear after customers review products." />
        )}
        {hasData && (
          <div className="flex flex-col gap-2.5 justify-center h-full px-1">
            {ratingDistribution.map((item, index) => {
              const maxCount = Math.max(
                ...ratingDistribution.map((r) => r.count),
                1,
              );
              const width =
                item.count > 0 ? Math.max((item.count / maxCount) * 100, 6) : 0;
              return (
                <div key={item.rating} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                    <span className="text-xs font-bold text-neutral-600 tabular-nums">
                      {item.rating}
                    </span>
                    <Star
                      className="w-3 h-3"
                      fill={RATING_COLORS[4 - index]}
                      stroke="none"
                    />
                  </div>
                  <div className="flex-1 bg-neutral-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: RATING_COLORS[4 - index],
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 tabular-nums w-6 text-right">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartCard>
  );
}
