"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

const NewsletterBox = () => {
  return (
    <div className="relative overflow-hidden bg-primary/90 rounded-2xl mb-6 md:mb-10">
      {/* Unified Layout — same structure on all screens */}
      <div className="flex items-center w-full relative">
        <Image
          src="/newsletter-icon.png"
          alt=""
          width={160}
          height={100}
          className="absolute -top-4 sm:-top-6 md:-top-8 -left-2 sm:-left-3 md:-left-4 w-[60px] sm:w-[80px] md:w-[120px] lg:w-[160px] h-auto opacity-50 pointer-events-none"
        />

        {/* Left Content */}
        <div className="w-[55%] sm:w-1/2 py-6 sm:py-8 md:py-24 px-4 sm:px-6 md:px-14 xl:px-18 space-y-2 sm:space-y-3 md:space-y-4 relative z-10">
          <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
            Where Gifting Begins With Love
          </h2>
          <p className="text-muted font-mono text-[10px] sm:text-xs md:text-base max-w-lg font-medium leading-relaxed">
            Don&apos;t miss out on our latest collections, exclusive offers, and
            heartfelt gifting inspiration.
          </p>
          <Button
            suppressHydrationWarning
            className="bg-white text-primary hover:bg-white/90 rounded-xl sm:rounded-2xl py-2 sm:py-3 md:py-5 px-4 sm:px-5 md:px-8 font-semibold text-[10px] sm:text-xs md:text-base shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            Start Gifting
          </Button>
        </div>

        {/* Right Image */}
        <div className="w-[45%] sm:w-1/2 relative overflow-hidden rounded-r-2xl self-stretch bg-primary/20 flex items-center justify-center min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[260px]">
          <Image
            src="/footer-background.webp"
            alt="Gifting Banner"
            fill
            sizes="(max-width: 640px) 45vw, 50vw"
            className="object-cover object-left"
          />
        </div>
      </div>
    </div>
  );
};

export default NewsletterBox;
