"use client";

import { useQuery } from "convex/react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  BookOpen,
  CakeSlice,
  CalendarHeart,
  ChevronRight,
  Church,
  Crown,
  Flame,
  Flower2,
  Gem,
  Gift,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  Home,
  Lamp,
  MessageCircleHeart,
  Moon,
  PackageOpen,
  PartyPopper,
  Ribbon,
  Smile,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import ProductCard from "./ProductCard";

// ─── Icon map keyed by occasion slug ─────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  // Milestones
  birthday: CakeSlice,
  anniversary: CalendarHeart,
  wedding: Gem,
  engagement: Church,
  graduation: GraduationCap,
  retirement: Trophy,
  "baby-shower": Baby,
  // Love & Family
  "valentines-day": Heart,
  "mothers-day": Flower2,
  "fathers-day": Crown,
  "womens-day": Sparkles,
  "karwa-chauth": Moon,
  "bhai-dooj": Users,
  "friendship-day": HeartHandshake,
  "childrens-day": Smile,
  "teachers-day": BookOpen,
  // Festive & Events
  rakhi: Ribbon,
  diwali: Flame,
  holi: PartyPopper,
  christmas: Snowflake,
  "new-year": Star,
  eid: Moon,
  navratri: Lamp,
  onam: Sun,
  pongal: Sun,
  lohri: Flame,
  "ganesh-chaturthi": Sparkles,
  housewarming: Home,
  // Sentiments
  "thank-you": HandHeart,
  congratulations: Gift,
  "get-well-soon": MessageCircleHeart,
  sorry: MessageCircleHeart,
};

const DEFAULT_OCCASIONS = [
  { slug: "fathers-day", label: "Father's Day", icon: "" },
  { slug: "birthday", label: "Birthday", icon: "" },
  { slug: "anniversary", label: "Anniversary", icon: "" },
  { slug: "valentines", label: "Valentine's", icon: "" },
  { slug: "baby-shower", label: "Baby Shower", icon: "" },
  { slug: "graduation", label: "Graduation", icon: "" },
];

interface Occasion {
  slug: string;
  label: string;
  icon: string;
  link?: string;
}

// ─── Product grid ─────────────────────────────────────────────────────────────
function OccasionProducts({
  tag,
  occasionLabel,
  link,
}: {
  tag: string;
  occasionLabel: string;
  link?: string;
}) {
  const products = useQuery(api.products.getProductsByOccasion, {
    tag,
    limit: 5,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const _scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const _scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Loading skeleton
  if (products === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] rounded-xl bg-gray-100" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-10 gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center">
          <PackageOpen className="w-6 h-6 text-primary/50" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-700">
            No gifts yet for this occasion
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tag products with{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">
              {tag}
            </code>{" "}
            to show them here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="relative group/carousel mt-4 md:mt-5">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3 md:gap-0">
            {products.map((product: any) => (
              <div
                key={product._id}
                className="flex-none w-[155px] md:w-[calc(100%/5)] md:px-1.5"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View All */}
      <div className="flex justify-center mt-5 md:mt-6">
        <a
          href={link || `/products?tag=${tag}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-800 border border-gray-200 rounded-full px-6 py-2 hover:border-gray-400 transition-all duration-200 cursor-pointer"
        >
          View All {occasionLabel} Gifts
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ShopByOccasion = () => {
  const dbOccasions = useQuery(api.occasions.getOccasions);

  const occasions: Occasion[] = (() => {
    if (!dbOccasions || dbOccasions.length === 0) {
      return [...DEFAULT_OCCASIONS];
    }
    return dbOccasions.map((o) => ({
      slug: o.slug,
      label: o.label,
      icon: o.icon,
      link: o.link,
    }));
  })();

  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIdx(0);
    setPrevIdx(0);
  }, []);

  const activeOccasion = occasions[activeIdx];
  const direction = activeIdx >= prevIdx ? 1 : -1;

  const handleTabClick = (idx: number) => {
    setPrevIdx(activeIdx);
    setActiveIdx(idx);
  };

  // Scroll active tab into center on mobile (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const container = tabsRef.current;
    if (!container) return;
    const activeTab = container.children[activeIdx] as HTMLElement;
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIdx]);

  return (
    <section className="py-2 md:py-8 lg:py-12 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 md:px-10 lg:px-16 xl:px-20">
        {/* Title */}
        <div className="flex items-center gap-2 md:block mb-3 md:mb-4 lg:mb-6 xl:mb-8">
          <div className="w-1 h-5 bg-emerald-500 rounded-full md:hidden" />
          <h2 className="text-[15px] sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold md:font-semibold text-neutral-900">
            Tailored For Your Occasions
          </h2>
        </div>

        {/* Tab Bar — exact reference style */}
        <div
          ref={tabsRef}
          className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-8 xl:gap-10 2xl:gap-12 overflow-x-auto pb-0 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {occasions.map((occasion, idx) => {
            const isActive = idx === activeIdx;
            const IconComponent = ICON_MAP[occasion.slug];

            return (
              <button
                suppressHydrationWarning
                key={occasion.slug}
                type="button"
                onClick={() => handleTabClick(idx)}
                className={`
                  flex flex-col items-center gap-1 md:gap-1.5 lg:gap-2 px-3 md:px-4 lg:px-5 xl:px-6
                  text-[13px] md:text-xs lg:text-[13px] xl:text-sm font-medium whitespace-nowrap transition-all
                  duration-200 cursor-pointer flex-none min-w-[70px] md:min-w-[60px] lg:min-w-[70px] xl:min-w-[80px]
                  ${
                    isActive
                      ? `bg-[#fff9ee] text-black pt-[9px] pb-4 -mb-px relative z-10 border-t-[3px] border-t-primary ${idx === 0 ? "rounded-tr-lg" : "rounded-t-lg"}`
                      : "bg-transparent text-gray-500 hover:text-gray-800 hover:bg-black/5 pt-[9px] pb-3 border-t-[3px] border-t-transparent rounded-t-lg"
                  }
                `}
              >
                {/* Icon */}
                <span className="flex items-center justify-center w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7">
                  {IconComponent ? (
                    <IconComponent
                      className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <span className="text-xl leading-none">
                      {occasion.icon}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={`leading-tight text-center ${
                    isActive ? "font-semibold text-black" : "text-gray-600"
                  }`}
                >
                  {occasion.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Area — animated */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeOccasion?.slug}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`bg-[#fff9ee] p-3 md:p-4 lg:p-5 ${
              activeIdx === 0
                ? "rounded-xl md:rounded-2xl rounded-tl-none md:rounded-tl-none"
                : "rounded-xl md:rounded-2xl"
            } relative z-0`}
          >
            {activeOccasion && (
              <OccasionProducts
                tag={activeOccasion.slug}
                occasionLabel={activeOccasion.label}
                link={activeOccasion.link}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ShopByOccasion;
