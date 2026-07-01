"use client";

import { useQuery } from "convex/react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface CustomerReviewsProps {
  productId: Id<"products">;
}

const getRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const CustomerReviews = ({ productId }: CustomerReviewsProps) => {
  const reviews = useQuery(api.reviews.listProductReviews, { productId });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (reviews === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 border-t border-neutral-100">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800 mb-4 sm:mb-6">
          Customer Reviews
        </h2>
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-[80%] sm:w-[45%] md:w-[35%] lg:w-[28%] bg-neutral-50 h-[160px] sm:h-[180px] rounded-lg sm:rounded-xl border border-neutral-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 border-t border-neutral-100 text-center flex flex-col items-center justify-center gap-1.5">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-800">
          Customer Reviews
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-500 max-w-sm leading-relaxed">
          No reviews yet for this product. Write a review from your order
          details after purchase!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 border-t border-neutral-100">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800">
          Customer Reviews
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:inline">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </span>
          <button className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-neutral-700 border border-[#bfa268] rounded-md hover:bg-[#bfa268]/5 transition-colors cursor-pointer">
            Show All Reviews{" "}
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div ref={emblaRef} className="overflow-hidden py-2">
          <div className="flex -ml-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="flex-none w-[80%] sm:w-[45%] md:w-[35%] lg:w-[28%] pl-3 sm:pl-4"
              >
                <div className="flex flex-col justify-between h-[160px] sm:h-[180px] p-3.5 sm:p-5 bg-white border border-neutral-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {/* Review Header */}
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#566e7a] text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                        {review.userInitials}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs sm:text-sm text-neutral-700 flex items-center">
                          <span className="font-medium truncate max-w-[100px] sm:max-w-[130px] capitalize">
                            {review.userName}
                          </span>
                          <span className="text-neutral-400 mx-1">•</span>
                          <span className="text-neutral-400 text-xs">
                            {getRelativeTime(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-[#008a00] text-[#008a00]"
                                  : "fill-neutral-200 text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs sm:text-sm text-neutral-700 mt-2 sm:mt-3 line-clamp-3 leading-relaxed">
                      {review.reviewText}
                    </p>
                  </div>

                  {/* Review Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                    <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-neutral-100 rounded text-[10px] sm:text-[11px] text-neutral-600 font-medium">
                      Verified Purchase
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Arrow Navigation */}
        {prevBtnEnabled && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 w-9 h-9 rounded-full border border-gray-300 bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Arrow Navigation */}
        {nextBtnEnabled && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-9 h-9 rounded-full border border-gray-300 bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
