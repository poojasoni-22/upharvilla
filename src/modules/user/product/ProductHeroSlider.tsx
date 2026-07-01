"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────────
   SLIDE DATA
   ────────────────────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    image: "/promo-offer-1.png",
    tag: "UPHARVILLA",
    title: "Memories That Last",
    subtitle: "Beautifully crafted photo gifts for every cherished moment.",
    gradient:
      "from-indigo-500/10 via-purple-500/5 to-white border-purple-100/60",
    badge: "bg-purple-50 text-purple-700 border-purple-100",
    glow: "bg-purple-400/10",
  },
  {
    image: "/promo-offer-2.png",
    tag: "CUSTOMIZED",
    title: "Made Just for Them",
    subtitle: "Personalized gifts that speak from the heart.",
    gradient: "from-amber-500/15 via-orange-500/5 to-white border-amber-100/60",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    glow: "bg-amber-400/10",
  },
  {
    image: "/promo-offer-3.png",
    tag: "TRENDING",
    title: "Gift with Meaning",
    subtitle:
      "Thoughtful pieces designed to make every occasion unforgettable.",
    gradient: "from-rose-500/15 via-pink-500/5 to-white border-rose-100/60",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    glow: "bg-rose-400/10",
  },
  {
    image: "/promo-offer-4.png",
    tag: "PREMIUM",
    title: "Crafted with Love",
    subtitle: "From us to yours — gifts that truly stand out.",
    gradient: "from-rose-500/15 via-pink-500/5 to-white border-rose-100/60",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    glow: "bg-rose-400/10",
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   SLIDE BOX — a single auto-rotating banner card
   Uses aspect-ratio for intrinsic sizing so it scales identically at every vw.
   Text uses clamp() for smooth fluid scaling — no breakpoint jumps.
   ────────────────────────────────────────────────────────────────────────────── */
interface SlideBoxProps {
  slides: typeof SLIDES;
  initialSlide?: number;
}

function SlideBox({ slides, initialSlide = 0 }: SlideBoxProps) {
  const [current, setCurrent] = useState(initialSlide);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startInterval]);

  const slide = slides[current];

  return (
    <div
      className={`
        hero-slide group relative flex-1 rounded-2xl overflow-hidden
        bg-gradient-to-br border transition-all duration-500 ease-in-out
        ${slide.gradient}
      `}
    >
      {/* ── Text side (left 60%) ─────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col justify-center h-full w-[60%] px-[5%] py-[6%]"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.4s, transform 0.4s",
        }}
      >
        <span
          className={`
            inline-flex items-center self-start px-2 py-0.5 rounded-full
            font-bold uppercase tracking-wide border shadow-sm mb-[4%]
            ${slide.badge}
          `}
          style={{ fontSize: "clamp(7px, 0.7vw, 11px)" }}
        >
          <span className="w-1 h-1 rounded-full bg-current mr-1.5 animate-pulse" />
          {slide.tag}
        </span>

        <h2
          className="font-extrabold text-neutral-900 leading-[1.15] tracking-tight"
          style={{ fontSize: "clamp(14px, 2vw, 28px)" }}
        >
          {slide.title}
        </h2>

        <p
          className="mt-[3%] text-neutral-500 leading-relaxed line-clamp-2"
          style={{ fontSize: "clamp(9px, 1vw, 14px)" }}
        >
          {slide.subtitle}
        </p>
      </div>

      {/* ── Image side (right 40%) ───────────────────────────────── */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[40%] overflow-hidden pointer-events-none"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? "scale(0.92) translateY(6px)"
            : "scale(1) translateY(0)",
          transition: "opacity 0.45s, transform 0.45s",
        }}
      >
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-contain object-bottom drop-shadow-lg"
            sizes="(max-width: 768px) 40vw, 20vw"
            priority
          />
        </div>
      </div>

      {/* ── Dot Indicators ───────────────────────────────────────── */}
      <div className="absolute bottom-[8%] left-[5%] flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              goTo(idx);
              startInterval();
            }}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              idx === current
                ? "w-6 h-1.5 bg-neutral-800 shadow-sm"
                : "w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ── Glow accent ──────────────────────────────────────────── */}
      <div
        className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${slide.glow}`}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   HERO SLIDER LAYOUT
   Mobile: 1 card, aspect-[2.2/1]
   Desktop (md+): 2 cards side by side, aspect-[2.5/1]
   ────────────────────────────────────────────────────────────────────────────── */
export default function ProductHeroSlider() {
  return (
    <>
      {/* Intrinsic sizing via aspect-ratio — the card heights are always proportional to width */}
      <style jsx>{`
        .hero-slide {
          aspect-ratio: 2.4 / 1;
        }
        @media (min-width: 768px) {
          .hero-slide {
            aspect-ratio: 2.6 / 1;
          }
        }
      `}</style>

      <div className="mx-4 md:mx-8 lg:mx-12 mt-4 md:mt-6 mb-4 flex flex-col md:flex-row gap-3 md:gap-5 lg:gap-6">
        <SlideBox slides={SLIDES} initialSlide={0} />
        {/* Second slider — desktop only */}
        <div className="hidden md:flex flex-1">
          <SlideBox slides={SLIDES} initialSlide={1 % SLIDES.length} />
        </div>
      </div>
    </>
  );
}
