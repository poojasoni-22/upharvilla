"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const priceCategories = [
  {
    label: "Under ₹499",
    price: "499",
    image: "/price-under-499.svg",
    tagline: "Thoughtful gifts",
    bg: "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/50",
    border: "border-rose-200/60 hover:border-rose-300",
    accent: "bg-rose-500",
    accentLight: "bg-rose-100 text-rose-700",
    text: "text-rose-600",
    shadow: "hover:shadow-rose-200/50",
  },
  {
    label: "Under ₹699",
    price: "699",
    image: "/price-under-699.svg",
    tagline: "Premium picks",
    bg: "bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100/50",
    border: "border-violet-200/60 hover:border-violet-300",
    accent: "bg-violet-500",
    accentLight: "bg-violet-100 text-violet-700",
    text: "text-violet-600",
    shadow: "hover:shadow-violet-200/50",
  },
  {
    label: "Under ₹999",
    price: "999",
    image: "/price-under-999.svg",
    tagline: "Curated collection",
    bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50",
    border: "border-amber-200/60 hover:border-amber-300",
    accent: "bg-amber-500",
    accentLight: "bg-amber-100 text-amber-700",
    text: "text-amber-600",
    shadow: "hover:shadow-amber-200/50",
  },
  {
    label: "Under ₹1599",
    price: "1599",
    image: "/price-under-1599.svg",
    tagline: "Luxury hampers",
    bg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50",
    border: "border-emerald-200/60 hover:border-emerald-300",
    accent: "bg-emerald-500",
    accentLight: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-600",
    shadow: "hover:shadow-emerald-200/50",
  },
];

const ShopByPrice = () => {
  return (
    <section className="py-2 sm:py-4 md:py-6 lg:py-8 px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20 bg-white relative overflow-hidden">
      {/* Decorative background removed for clean white */}

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center justify-between md:block">
          <div className="flex items-center gap-2 md:block">
            <div className="w-1 h-5 bg-[#E11D48] rounded-full md:hidden" />
            <h2 className="text-[15px] sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold md:font-semibold text-neutral-900">
              Shop By Price
            </h2>
          </div>
          <a
            href="/products"
            className="text-[#E11D48] text-[11px] font-semibold flex items-center gap-0.5 md:hidden"
          >
            View All <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground font-mono text-xs sm:text-sm md:text-sm lg:text-base max-w-2xl font-medium hidden md:block mt-1 md:mt-2"
        >
          Shop your favourite gift hampers under your budget.
        </motion.p>

        {/* ── Mobile & Tablet: 2x2 grid (below md) ── */}
        <div className="grid grid-cols-2 md:hidden gap-2 mt-2">
          {priceCategories.map((category, index) => (
            <Link
              key={category.price}
              href={`/products?maxPrice=${category.price}`}
              className="group block"
            >
              <div
                className={`relative overflow-hidden ${category.bg} border ${category.border} shadow-sm transition-all duration-400 active:scale-[0.97]`}
                style={{
                  borderRadius:
                    index % 2 === 0
                      ? "10px 22px 10px 22px"
                      : "22px 10px 22px 10px",
                }}
              >
                {/* Gift image — compact, centered */}
                <div className="relative w-full aspect-[16/9] overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-[65%] h-auto object-contain mix-blend-multiply"
                  />
                </div>
                {/* Price label — compact */}
                <div className="px-2 pb-2 -mt-2 text-center">
                  <p
                    className={`text-[11px] font-black ${category.text} leading-tight`}
                  >
                    {category.label}
                  </p>
                  <p className="text-[7px] text-gray-400 font-medium mt-0.5">
                    {category.tagline}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Desktop: Featured card + 2x2 grid ── */}
        <div className="hidden md:flex flex-row gap-3 lg:gap-4 items-stretch mt-4 md:mt-5 max-h-[380px]">
          {/* Left Featured Card */}
          <div className="w-1/2 flex">
            <Link href="/products" className="group block w-full">
              <motion.div
                className="relative w-full h-full overflow-hidden bg-[#fbf0dd] shadow-sm rounded-[1.5rem] lg:rounded-[2rem] rounded-br-none p-3 md:p-3 lg:p-4 pb-8 md:pb-8 lg:pb-10 flex flex-col transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/15 cursor-pointer"
                whileHover={{ scale: 1.012 }}
                transition={{ duration: 0.4 }}
              >
                {/* Image — centered */}
                <div className="relative flex-1 min-h-[140px] md:min-h-[120px] lg:min-h-[150px] xl:min-h-[170px] w-full overflow-hidden flex items-center justify-center p-4">
                  <img
                    src="/price-hero-banner.svg"
                    alt="Shop By Price"
                    className="w-[65%] h-auto max-h-[200px] object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Text */}
                <div className="pt-2 lg:pt-3 pr-12 mt-auto">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 rounded-full text-[8px] lg:text-[9px] font-bold uppercase tracking-wider bg-[#E11D48]/10 text-[#E11D48] mb-1 lg:mb-1.5">
                    <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> Budget
                    Friendly
                  </span>
                  <h3 className="text-lg md:text-lg lg:text-xl xl:text-2xl font-extrabold text-[#E11D48] transition-colors duration-300 group-hover:text-primary mb-0.5 lg:mb-1">
                    Shop By Price
                  </h3>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-medium leading-relaxed max-w-[85%]">
                    Explore our premium, hand-picked gift hampers crafted to fit
                    your pocket perfectly.
                  </p>
                </div>

                {/* Corner cutout */}
                <div className="absolute bottom-[-1px] right-[-1px] w-[48px] lg:w-[56px] xl:w-[64px] h-[48px] lg:h-[56px] xl:h-[64px] bg-white rounded-tl-[1.2rem] lg:rounded-tl-[1.5rem] pointer-events-none">
                  <div
                    className="absolute bottom-0 w-3 h-3 bg-white"
                    style={{ right: "100%" }}
                  >
                    <div className="w-full h-full bg-[#fbf0dd] rounded-br-[12px]" />
                  </div>
                  <div
                    className="absolute right-0 w-3 h-3 bg-white"
                    style={{ bottom: "100%" }}
                  >
                    <div className="w-full h-full bg-[#fbf0dd] rounded-br-[12px]" />
                  </div>
                </div>

                {/* Arrow button */}
                <div className="absolute bottom-1.5 right-1.5 lg:bottom-2 lg:right-2 w-9 h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-full bg-[#E11D48] flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary z-10">
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5]" />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Right Price Grid — 2x2, stretches to match hero height */}
          <div className="w-1/2 grid grid-cols-2 auto-rows-fr gap-2.5 md:gap-2.5 lg:gap-3">
            {priceCategories.map((category, index) => (
              <motion.div
                key={category.price}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="group cursor-pointer h-full"
              >
                <Link
                  href={`/products?maxPrice=${category.price}`}
                  className="block h-full"
                >
                  <motion.div
                    className={`relative overflow-hidden h-full flex flex-col ${category.bg} border ${category.border} shadow-sm transition-all duration-500 ${category.shadow} group-hover:shadow-xl`}
                    style={{
                      borderRadius:
                        index % 2 === 0
                          ? "12px 36px 12px 36px"
                          : "36px 12px 36px 12px",
                    }}
                    whileHover={{
                      borderRadius:
                        index % 2 === 0
                          ? "36px 12px 36px 12px"
                          : "12px 36px 12px 36px",
                      scale: 1.03,
                    }}
                  >
                    {/* Gift image — centered, crisp SVG */}
                    <div className="relative w-full flex-1 overflow-hidden flex items-center justify-center p-2 md:p-3 lg:p-3">
                      <img
                        src={category.image}
                        alt={category.label}
                        className="w-[60%] h-auto object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Top-left badge */}
                    <div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 lg:top-3 lg:left-3 z-10">
                      <span
                        className={`inline-block px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full text-[7px] md:text-[8px] lg:text-[9px] font-bold ${category.accentLight} shadow-sm`}
                      >
                        {category.tagline}
                      </span>
                    </div>

                    {/* Price label — centered, responsive text */}
                    <div className="px-2 md:px-2.5 pb-1 md:pb-1.5 -mt-0.5 text-center">
                      <p
                        className={`text-xs md:text-sm lg:text-base font-black ${category.text} leading-none tracking-tight`}
                      >
                        {category.label}
                      </p>
                      <p className="text-[7px] md:text-[8px] lg:text-[9px] text-gray-400 font-medium mt-0.5 truncate">
                        {category.tagline}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByPrice;
