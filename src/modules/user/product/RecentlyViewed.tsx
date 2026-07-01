"use client";

import { useQuery } from "convex/react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";
import ProductCard from "../components/ProductCard";

interface RecentlyViewedProps {
  currentProductId: string;
}

export const RecentlyViewed = ({ currentProductId }: RecentlyViewedProps) => {
  const { data: session } = authClient.useSession();

  // Fetch recently viewed items from Convex (only for logged-in users)
  const recentlyViewedQuery = useQuery(
    api.recentlyViewed.list,
    session ? undefined : "skip",
  );

  const recentlyViewedItems = (recentlyViewedQuery || []).filter(
    (product) => product._id !== currentProductId && product.isActive,
  );

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

  // If user is not logged in or has no recently viewed items, hide the section
  if (!session || recentlyViewedItems.length === 0) {
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-5 md:py-16 border-t border-neutral-100">
      {/* Header */}
      <div className="mb-3 md:mb-8 sm:px-0">
        {/* Mobile Header (Home-style) */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-[15px] font-bold text-neutral-900">
              Recently Viewed
            </h2>
          </div>
        </div>

        {/* Desktop Header */}
        <h2 className="hidden md:block text-2xl font-semibold text-neutral-800">
          Recently Viewed
        </h2>
      </div>

      {/* Mobile view: native scroll */}
      <div className="md:hidden mobile-scroll flex gap-3 pb-4">
        {recentlyViewedItems.map((product) => (
          <div key={product._id} className="flex-none w-[155px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Desktop view: Embla Carousel */}
      <div className="hidden md:block relative group">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -ml-4">
            {recentlyViewedItems.map((product) => (
              <div
                key={product._id}
                className="flex-none md:w-1/4 lg:w-1/5 xl:w-1/6 pl-4"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Left Arrow */}
        {prevBtnEnabled && (
          <button
            type="button"
            onClick={scrollPrev}
            style={{ top: "45%" }}
            className="absolute -left-5 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white shadow-md text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Arrow */}
        {nextBtnEnabled && (
          <button
            type="button"
            onClick={scrollNext}
            style={{ top: "45%" }}
            className="absolute -right-5 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white shadow-md text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
