"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const RELATIONSHIPS = [
  "Him",
  "Her",
  "Kids",
  "Friend",
  "Girlfriend",
  "Boyfriend",
  "Wife",
  "Husband",
];

const RELATIONSHIP_AVATARS: Record<string, string> = {
  Him: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
  Her: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  Kids: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=120&h=120&q=80",
  Friend:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
  Girlfriend:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
  Boyfriend:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80",
  Wife: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80",
  Husband:
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80",
};

interface RelationshipSelectorProps {
  selectedTags?: string[];
  onTagToggle?: (tag: string) => void;
  isMarquee?: boolean;
}

export default function RelationshipSelector({
  selectedTags = [],
  onTagToggle,
  isMarquee = !onTagToggle,
}: RelationshipSelectorProps) {
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    if (onTagToggle) {
      onTagToggle(tag);
    } else {
      router.push(`/products?tag=${encodeURIComponent(tag)}`);
    }
  };

  const renderPill = (rel: string, key: string) => {
    const isActive = selectedTags.includes(rel);
    return (
      <motion.button
        key={key}
        type="button"
        onClick={() => handleTagClick(rel)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center rounded-full border font-sans font-medium select-none transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap",
          isActive
            ? "bg-primary/10 text-primary border-primary font-bold shadow-md"
            : "bg-white text-neutral-700 border-neutral-200/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md",
        )}
        style={{
          padding:
            "clamp(3px, 0.4vw, 8px) clamp(10px, 1.2vw, 20px) clamp(3px, 0.4vw, 8px) clamp(3px, 0.35vw, 8px)",
          fontSize: "clamp(11px, 0.95vw, 14px)",
        }}
      >
        {RELATIONSHIP_AVATARS[rel] && (
          <div
            className="relative shrink-0"
            style={{
              width: "clamp(24px, 2.5vw, 36px)",
              height: "clamp(24px, 2.5vw, 36px)",
              marginRight: "clamp(4px, 0.5vw, 10px)",
            }}
          >
            <Image
              src={RELATIONSHIP_AVATARS[rel]}
              alt={rel}
              fill
              className="rounded-full object-cover border-2 border-white shadow-sm"
              loading="lazy"
              sizes="(max-width: 768px) 28px, 36px"
            />
          </div>
        )}
        <span>{rel}</span>
      </motion.button>
    );
  };

  return (
    <div className="relative w-full py-4 md:py-10 lg:py-12 flex flex-col items-center gap-3 md:gap-6 overflow-hidden bg-white">
      {/* Decorative blurred circles */}

      {/* Edge fade gradients for marquee */}
      {isMarquee && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-30" />
          <div className="absolute right-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-30" />
        </>
      )}

      {/* Section Header */}
      <div className="flex flex-col items-center gap-1.5 md:gap-2 px-4 z-20">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-bold md:font-semibold text-neutral-800 tracking-tight text-center"
          style={{ fontSize: "clamp(15px, 1.8vw, 30px)" }}
        >
          For Every Relationship
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-[2.5px] md:h-[3px] bg-gradient-to-r from-primary/60 to-primary rounded-full origin-center"
          style={{ width: "clamp(40px, 3vw, 80px)" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:block text-muted-foreground font-mono max-w-lg text-center tracking-wide"
          style={{ fontSize: "clamp(12px, 1vw, 16px)" }}
        >
          Find the perfect gift for every special person in your life.
        </motion.p>
      </div>

      {isMarquee ? (
        /* Marquee loop */
        <div className="relative w-full z-20 overflow-hidden py-1 md:py-2">
          <style>{`
            @keyframes relationship-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
            .relationship-track {
              display: flex;
              gap: 8px;
              width: max-content;
              animation: relationship-marquee 30s linear infinite;
            }
            @media (min-width: 768px) {
              .relationship-track {
                gap: 14px;
                animation-duration: 35s;
              }
            }
            .relationship-track:hover,
            .relationship-track:active {
              animation-play-state: paused;
            }
          `}</style>

          <div className="relationship-track px-2 md:px-4">
            {[0, 1, 2].map((setIdx) =>
              RELATIONSHIPS.map((rel) => renderPill(rel, `${setIdx}-${rel}`)),
            )}
          </div>
        </div>
      ) : (
        /* Static layout for products/listing pages — auto-scrolls on mobile */
        <>
          {/* Mobile: auto-scroll marquee */}
          <div className="relative w-full z-20 py-1 md:hidden overflow-hidden">
            {/* Edge fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-30" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-30" />

            <style>{`
              @keyframes static-pills-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-33.333%); }
              }
              .static-pills-track {
                display: flex;
                gap: 8px;
                width: max-content;
                animation: static-pills-scroll 22s linear infinite;
              }
              .static-pills-track:active {
                animation-play-state: paused;
              }
            `}</style>

            <div className="static-pills-track px-2">
              {[0, 1, 2].map((setIdx) =>
                RELATIONSHIPS.map((rel) =>
                  renderPill(rel, `static-${setIdx}-${rel}`),
                ),
              )}
            </div>
          </div>

          {/* Tablet & Desktop: centered static layout */}
          <div className="hidden md:flex relative w-full z-20 py-2 justify-center">
            <div
              className="flex items-center px-8 flex-wrap justify-center"
              style={{ gap: "clamp(8px, 1vw, 16px)" }}
            >
              {RELATIONSHIPS.map((rel) => renderPill(rel, rel))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
