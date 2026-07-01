"use client";

import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";

export const HeroSlider = () => {
  const banners = useQuery(api.heroBanners.getBanners);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const isLoading = banners === undefined;

  const displayBanners = (
    banners && banners.length > 0
      ? banners.slice(0, 5)
      : Array.from({ length: 5 }).map((_, index) => ({
          _id: `placeholder-${index}`,
          imageLink: "",
          altText: `Placeholder Banner ${index + 1}`,
          visitLink: "#",
        }))
  ) as Array<{
    _id: string;
    imageLink: string;
    altText?: string;
    visitLink: string;
  }>;

  useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    };

    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  // Autoplay with interaction pause/resume
  useEffect(() => {
    if (!carouselApi) return;

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        carouselApi.scrollNext();
      }, 5000);
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
    };

    startAutoplay();

    // Pause autoplay on user pointer interaction
    carouselApi.on("pointerDown", stopAutoplay);
    // Reset timer on slide select to prevent sudden jumps
    carouselApi.on("select", startAutoplay);
    // Restart autoplay when carousel settles
    carouselApi.on("settle", startAutoplay);

    return () => {
      stopAutoplay();
      carouselApi.off("pointerDown", stopAutoplay);
      carouselApi.off("select", startAutoplay);
      carouselApi.off("settle", startAutoplay);
    };
  }, [carouselApi]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 md:pb-2 group relative">
      <Carousel
        setApi={setCarouselApi}
        className="w-full relative overflow-visible"
        opts={{
          loop: true,
          align: "center",
          duration: 18, // Faster, snappy transition duration
        }}
      >
        <CarouselContent className="-ml-5">
          {displayBanners.map((banner, index) => {
            const content = (
              <div
                className={cn(
                  "relative w-full aspect-[2/1] sm:h-[340px] sm:aspect-auto md:h-[320px] lg:h-[360px] xl:h-[400px] overflow-hidden rounded-xl bg-muted border border-neutral-100/50 shadow-md transition-all duration-500",
                  isLoading && "animate-pulse",
                )}
              >
                {banner.imageLink ? (
                  <Image
                    src={banner.imageLink}
                    alt={banner.altText || `Banner ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 450px, (max-width: 1024px) 600px, (max-width: 1280px) 700px, 800px"
                    priority={index === 0}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-100/80 animate-pulse flex items-center justify-center">
                    {isLoading && (
                      <span className="text-sm font-medium text-neutral-400 font-sans">
                        Loading...
                      </span>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <CarouselItem
                key={banner._id}
                className="pl-5 basis-full sm:basis-[450px] md:basis-[600px] lg:basis-[700px] xl:basis-[800px] shrink-0 grow-0"
              >
                {banner.imageLink ? (
                  <Link href={banner.visitLink}>{content}</Link>
                ) : (
                  content
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Custom Navigation Buttons */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            carouselApi?.scrollPrev();
          }}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 shadow-lg bg-white hover:bg-neutral-50 border border-neutral-200 h-10 w-10 md:h-12 md:w-12 transition-all duration-300 flex items-center justify-center rounded-full text-neutral-800 cursor-pointer active:scale-95 hover:scale-105 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            carouselApi?.scrollNext();
          }}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 shadow-lg bg-white hover:bg-neutral-50 border border-neutral-200 h-10 w-10 md:h-12 md:w-12 transition-all duration-300 flex items-center justify-center rounded-full text-neutral-800 cursor-pointer active:scale-95 hover:scale-105 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
        </button>

        {/* Bottom Pagination Dots with Framer Motion */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
          {displayBanners.map((_, index) => {
            const isActive = current === index + 1;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  carouselApi?.scrollTo(index);
                }}
                className="relative flex items-center justify-center h-2 w-2"
                aria-label={`Go to slide ${index + 1}`}
              >
                <motion.div
                  animate={{
                    width: isActive ? 24 : 8,
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-2 rounded-full cursor-pointer"
                />
              </button>
            );
          })}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroSlider;
