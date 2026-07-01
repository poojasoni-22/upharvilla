"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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

const PROMO_SLIDES = [
  {
    id: "happy-couple",
    image: "/editorial-happy-couple.webp",
    altText: "A Gift As Unique As Your Love Story",
    badge: "Most Loved",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    badgeColor: "bg-[#8E54B0]/15 text-[#6D2F92]",
    title: "A Gift As Unique\nAs Your Love Story",
    subtitle:
      "Turn your favorite memories into timeless keepsakes they will cherish forever.",
    buttonText: "SHOP NOW",
    buttonBg:
      "bg-[#8E54B0] hover:bg-[#7A4599] active:scale-95 text-white shadow-[0_8px_20px_-6px_rgba(142,84,176,0.5)]",
    titleColor: "text-[#4A2663]",
    themeBg: "bg-gradient-to-br from-[#F5E8FB] via-[#FEFAFF] to-[#EBD6F5]",
    visitLink: "/products?tag=Anniversary",
    isWallet: true,
  },
  {
    id: "happy-family",
    image: "/editorial-happy-family.webp",
    altText: "Celebrate The People Who Matter Most",
    badge: "Perfect For Families",
    badgeIcon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    badgeColor: "bg-[#D94852]/15 text-[#B52530]",
    title: "Celebrate The People\nWho Matter Most",
    subtitle:
      "Find the perfect personalized gift to capture your family's most beautiful moments.",
    buttonText: "SHOP NOW",
    buttonBg:
      "bg-[#D94852] hover:bg-[#BD3A43] active:scale-95 text-white shadow-[0_8px_20px_-6px_rgba(217,72,82,0.5)]",
    titleColor: "text-[#752026]",
    themeBg: "bg-gradient-to-br from-[#FFF2F3] via-[#FFFFFF] to-[#FCE5E6]",
    visitLink: "/products?tag=Customized Hampers",
    isWallet: false,
  },
];

export const EditorialSlider = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [_current, setCurrent] = useState(0);

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
      }, 6000);
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
    <section
      className="w-full md:mb-4 max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 group relative"
      id="editorial-slider"
    >
      {/* Title / Section Intro styled elegantly */}
      <div className="flex flex-col items-center text-center mb-2 md:mb-6">
        <h2 className="text-lg md:text-3xl lg:text-4xl font-serif text-neutral-800 tracking-wide font-normal">
          Gifts That Tell a Beautiful Story
        </h2>
        <div className="h-[2px] w-12 md:w-16 bg-primary/40 mt-2 md:mt-4 rounded-full" />
      </div>

      <Carousel
        setApi={setCarouselApi}
        className="w-full relative overflow-visible rounded-2xl shadow-sm"
        opts={{
          loop: true,
          align: "center",
          duration: 30, // Extremely smooth transition
        }}
      >
        <CarouselContent className="-ml-4">
          {PROMO_SLIDES.map((slide, index) => {
            return (
              <CarouselItem
                key={slide.id}
                className="pl-4 basis-full shrink-0 grow-0 group/item"
              >
                {/* Mobile: Beautiful horizontal card */}
                <div
                  className={cn(
                    "relative w-full overflow-hidden rounded-2xl transition-all duration-700 md:hidden",
                    slide.themeBg,
                  )}
                >
                  <div className="flex items-stretch">
                    {/* Left: Image */}
                    <div className="w-[40%] relative min-h-[180px]">
                      <Image
                        src={slide.image}
                        alt={slide.altText}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 40vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                    {/* Right: Text content */}
                    <div className="w-[60%] flex flex-col justify-center p-4">
                      <h3
                        className={cn(
                          "text-[15px] font-bold leading-tight tracking-tight mb-1.5",
                          slide.titleColor,
                        )}
                      >
                        {slide.title.replace("\n", " ")}
                      </h3>
                      <p className="text-[10px] text-neutral-600 leading-snug mb-3 line-clamp-2">
                        {slide.subtitle}
                      </p>
                      <Link
                        href={slide.visitLink}
                        className={cn(
                          "self-start inline-flex items-center justify-center text-white px-4 py-1.5 rounded-lg font-semibold text-[10px] tracking-wide transition-all duration-300",
                          slide.buttonBg,
                        )}
                      >
                        {slide.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Desktop: Original full layout */}
                <div
                  className={cn(
                    "relative w-full overflow-hidden rounded-2xl transition-all duration-700 hidden md:flex flex-row items-center justify-between h-[300px] lg:h-[340px] xl:h-[380px] p-8 lg:p-10 xl:p-14",
                    slide.themeBg,
                  )}
                >
                  {/* Decorative Elements */}
                  {slide.isWallet ? (
                    <>
                      <svg
                        className="absolute top-1/4 left-[46%] w-4 h-4 text-[#D8B4F8] fill-current opacity-70 animate-bounce"
                        viewBox="0 0 24 24"
                        style={{ animationDuration: "3s" }}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <svg
                        className="absolute top-1/3 left-[48%] w-3 h-3 text-[#E2C7FA] fill-current opacity-60 animate-pulse"
                        viewBox="0 0 24 24"
                        style={{ animationDuration: "2s" }}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-12 left-12 opacity-65 rotate-[15deg]">
                        <svg
                          className="w-6 h-6 text-[#C92A31] fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 7c-1.5-2.5-4.5-3-6-1.5S4.5 10 7 11.5c2.5 1.5 4.5.5 5-.5.5 1 2.5 2 5 .5 2.5-1.5 2.5-4.5 1-6s-4.5-1-6 1.5zm0 1c-.8-1.3-2.5-1.7-3.3-1s-.7 2.3.5 3c1.2.7 2.3.2 2.8-.5-.2-.5-.1-1-.8-1.5zm.8.5c.5.7 1.6 1.2 2.8.5 1.2-.7 1.3-2.3.5-3-.8-.7-2.5-.3-3.3 1-.7.5-.6 1 .8 1.5zM12 11c-.3 0-.6.1-.8.3L7.5 16c-.5.5-.5 1.3 0 1.8s1.3.5 1.8 0l3-3.2c.4.3.9.3 1.3 0l3 3.2c.5.5 1.3.5 1.8 0s.5-1.3 0-1.8l-3.7-4.7c-.2-.2-.5-.3-.8-.3z" />
                        </svg>
                      </div>
                      <div className="absolute top-[20%] left-[45%] opacity-65 -rotate-[12deg]">
                        <svg
                          className="w-5 h-5 text-[#C92A31] fill-current animate-pulse"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 7c-1.5-2.5-4.5-3-6-1.5S4.5 10 7 11.5c2.5 1.5 4.5.5 5-.5.5 1 2.5 2 5 .5 2.5-1.5 2.5-4.5 1-6s-4.5-1-6 1.5zm0 1c-.8-1.3-2.5-1.7-3.3-1s-.7 2.3.5 3c1.2.7 2.3.2 2.8-.5-.2-.5-.1-1-.8-1.5zm.8.5c.5.7 1.6 1.2 2.8.5 1.2-.7 1.3-2.3.5-3-.8-.7-2.5-.3-3.3 1-.7.5-.6 1 .8 1.5zM12 11c-.3 0-.6.1-.8.3L7.5 16c-.5.5-.5 1.3 0 1.8s1.3.5 1.8 0l3-3.2c.4.3.9.3 1.3 0l3 3.2c.5.5 1.3.5 1.8 0s.5-1.3 0-1.8l-3.7-4.7c-.2-.2-.5-.3-.8-.3z" />
                        </svg>
                      </div>
                    </>
                  )}

                  {/* Left Column: Text */}
                  <div className="w-[50%] flex flex-col items-center justify-center text-center z-10 px-4 lg:px-8">
                    <h3
                      className={cn(
                        "text-2xl lg:text-3xl xl:text-4xl font-sans font-bold leading-[1.1] tracking-tight mb-3 lg:mb-4 whitespace-pre-line drop-shadow-sm",
                        slide.titleColor,
                      )}
                    >
                      {slide.title}
                    </h3>
                    <p className="text-xs lg:text-sm xl:text-base text-neutral-800 font-medium leading-[1.5] mb-4 lg:mb-6 max-w-[300px] lg:max-w-[360px] xl:max-w-[400px]">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.visitLink}
                      className={cn(
                        "group inline-flex items-center justify-center text-white px-6 py-2.5 lg:px-8 lg:py-3 rounded-xl font-semibold text-xs lg:text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                        slide.buttonBg,
                      )}
                    >
                      <span>{slide.buttonText}</span>
                    </Link>
                  </div>

                  {/* Right Column: Image */}
                  <div className="w-[50%] flex items-center justify-end relative z-10">
                    <div
                      className={cn(
                        "backdrop-blur-md p-3 rounded-2xl border border-white/80 hover:scale-[1.04] transition-all duration-700 w-full max-w-[260px] lg:max-w-[320px] xl:max-w-[380px] aspect-[1.46] relative overflow-hidden flex items-center justify-center group/card ring-1 ring-white/50 bg-white/90",
                        slide.isWallet
                          ? "shadow-[0_20px_60px_-15px_rgba(142,84,176,0.25)] hover:rotate-2"
                          : "shadow-[0_20px_60px_-15px_rgba(217,72,82,0.25)] hover:-rotate-2 rounded-3xl",
                      )}
                    >
                      <div
                        className={cn(
                          "relative w-full h-full overflow-hidden shadow-inner",
                          slide.isWallet
                            ? "rounded-xl border border-neutral-100/30"
                            : "rounded-2xl",
                        )}
                      >
                        <Image
                          src={slide.image}
                          alt={slide.altText}
                          fill
                          sizes="(max-width: 768px) 80vw, 40vw"
                          className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Custom Navigation Buttons — desktop only */}
        <div className="absolute bottom-6 right-8 z-20 hidden md:flex items-center gap-3 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            suppressHydrationWarning
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              carouselApi?.scrollPrev();
            }}
            className="shadow-md bg-white hover:bg-neutral-50 border border-neutral-200/80 h-9 w-9 md:h-11 md:w-11 transition-all duration-300 flex items-center justify-center rounded-full text-neutral-800 cursor-pointer active:scale-90 hover:scale-105 hover:border-primary/30"
            aria-label="Previous slide"
          >
            <ChevronLeft
              className="h-4.5 w-4.5 md:h-5 md:w-5 text-neutral-700"
              strokeWidth={2}
            />
          </button>
          <button
            suppressHydrationWarning
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              carouselApi?.scrollNext();
            }}
            className="shadow-md bg-white hover:bg-neutral-50 border border-neutral-200/80 h-9 w-9 md:h-11 md:w-11 transition-all duration-300 flex items-center justify-center rounded-full text-neutral-800 cursor-pointer active:scale-90 hover:scale-105 hover:border-primary/30"
            aria-label="Next slide"
          >
            <ChevronRight
              className="h-4.5 w-4.5 md:h-5 md:w-5 text-neutral-700"
              strokeWidth={2}
            />
          </button>
        </div>
      </Carousel>
    </section>
  );
};

export default EditorialSlider;
