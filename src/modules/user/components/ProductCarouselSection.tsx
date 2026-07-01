"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useCallback } from "react";
import ProductCard from "./ProductCard";

interface ProductCarouselSectionProps {
  /** Array of products to display */
  products: any[] | undefined;
  /** Section title shown on both mobile and desktop */
  title: string;
  /** Subtitle shown only on desktop below the title */
  subtitle: string;
  /** Link for "View All" button */
  viewAllLink: string;
  /** Text for the desktop "View All" CTA button */
  viewAllText: string;
  /** Accent color for the mobile header dot (tailwind class e.g. "bg-[#FC2779]") */
  accentColorClass?: string;
  /** Accent color for mobile "View All" text (tailwind class e.g. "text-[#FC2779]") */
  accentTextClass?: string;
  /** Extra CSS classes for the section element */
  sectionClassName?: string;
  /** Optional decorative background elements */
  decorations?: React.ReactNode;
  /** Optional footer content below the CTA (e.g. trust badge) */
  footerExtra?: React.ReactNode;
  /** Max products to show on mobile scroll (defaults to 5) */
  mobileLimit?: number;
}

const ProductCarouselSection = ({
  products,
  title,
  subtitle,
  viewAllLink,
  viewAllText,
  accentColorClass = "bg-primary",
  accentTextClass = "text-primary",
  sectionClassName = "",
  decorations,
  footerExtra,
  mobileLimit = 5,
}: ProductCarouselSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Loading skeleton
  if (!products) {
    return (
      <div className="py-16 md:py-24 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-6 w-full max-w-7xl px-4">
          <div className="h-8 w-48 sm:w-64 bg-muted rounded-lg" />
          <div className="h-4 w-64 sm:w-96 bg-muted rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`relative ${sectionClassName}`}>
      {decorations}

      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 space-y-4 md:space-y-10 relative z-10">
        {/* ── Header ── */}
        <div className="md:px-0">
          {/* Mobile: compact left-aligned header */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-5 ${accentColorClass} rounded-full`} />
              <h2 className="text-[15px] font-bold text-neutral-900">
                {title}
              </h2>
            </div>
            <Link
              href={viewAllLink}
              className={`${accentTextClass} text-[11px] font-semibold flex items-center gap-0.5`}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop: centered header */}
          <div className="hidden md:block text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block relative"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold underline underline-offset-8">
                {title}
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground max-w-2xl font-mono mx-auto text-base md:text-lg lg:text-xl font-medium tracking-wide"
            >
              {subtitle}
            </motion.p>
          </div>
        </div>

        {/* ── Mobile: native horizontal scroll ── */}
        <div className="md:hidden mobile-scroll flex gap-3">
          {products.slice(0, mobileLimit).map((product: any) => (
            <div key={product._id} className="flex-none w-[155px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ── Desktop: Carousel with properly centered arrows ── */}
        <div className="hidden md:block relative">
          {/* Carousel viewport with horizontal padding for arrow space */}
          <div className="mx-12">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {products.map((product: any) => (
                  <div
                    key={product._id}
                    className="flex-none w-[calc(100%/5)] px-1.5"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Arrow — absolute, centered on product image */}
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-[35%] -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow — absolute, centered on product image */}
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-[35%] -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Footer CTA — desktop only ── */}
        <div className="hidden md:flex flex-col items-center mt-12 space-y-4">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-white hover:bg-primary/90 hover:shadow-md px-6 py-2 text-sm font-medium transition-all duration-150 cursor-pointer"
          >
            {viewAllText} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Optional extra footer (trust badge etc.) ── */}
        {footerExtra}
      </div>
    </section>
  );
};

export default ProductCarouselSection;
