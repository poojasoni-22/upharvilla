"use client";

import { Rating } from "@mui/material";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback } from "react";

// ─── Review Data ──────────────────────────────────────────────────────────────
const reviews = [
  {
    name: "Aarav Sharma",
    location: "Mumbai",
    text: "Ordered a birthday hamper for my wife and the presentation blew her away. The chocolates were fresh, the perfume was a premium brand, and the handwritten note they included was a lovely touch. Delivery was right on time too!",
    rating: 5,
    avatar: "/avatar-1.webp",
    date: "2 weeks ago",
    product: "Luxury Birthday Hamper",
    helpful: 24,
  },
  {
    name: "Ananya Iyer",
    location: "Bangalore",
    text: "Got the personalised photo frame for my parents' 25th anniversary. Print quality is excellent and the wood finish feels premium. Only slight issue — the engraving was a tiny bit off-centre, but overall very happy with it.",
    rating: 4.5,
    avatar: "/avatar-2.webp",
    date: "1 month ago",
    product: "Custom Photo Frame",
    helpful: 18,
  },
  {
    name: "Ishaan Gupta",
    location: "Delhi",
    text: "Needed a last-minute corporate gift for a client meeting. Placed the order at 11 PM and got it delivered by 10 AM next day! The gift set looked very professional. Customer support was incredibly responsive on WhatsApp.",
    rating: 5,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Ishaan&backgroundColor=b6e3f4",
    date: "3 weeks ago",
    product: "Premium Corporate Gift Set",
    helpful: 31,
  },
  {
    name: "Priya Nair",
    location: "Chennai",
    text: "The 'Under ₹499' range is genuinely good value. Got a cute desk organiser set for my colleague's farewell — looked way more expensive than it was. She absolutely loved it!",
    rating: 4,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc",
    date: "5 days ago",
    product: "Budget Gift Box",
    helpful: 12,
  },
  {
    name: "Rohan Verma",
    location: "Pune",
    text: "Third time ordering from UpharVilla. What I love is that each hamper feels curated — not just random products thrown together. The Diwali hamper had artisan sweets, a beautiful candle set, and dry fruits that were actually fresh.",
    rating: 5,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan&backgroundColor=c0aede",
    date: "1 week ago",
    product: "Festival Special Hamper",
    helpful: 42,
  },
  {
    name: "Sanya Kapoor",
    location: "Hyderabad",
    text: "Loved that they use eco-friendly packaging! The jute bag and recycled paper wrapping looked beautiful. Products matched the website photos accurately.",
    rating: 4.5,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Sanya&backgroundColor=ffdfbf",
    date: "2 weeks ago",
    product: "Eco Gift Collection",
    helpful: 15,
  },
  {
    name: "Vikram Rathore",
    location: "Jaipur",
    text: "We ordered 50+ hampers for our company's annual client appreciation gifts. The team at UpharVilla handled the bulk order seamlessly — custom branding, individual notes, and staggered deliveries across 12 cities.",
    rating: 5,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram&backgroundColor=d1f4d1",
    date: "3 days ago",
    product: "Corporate Bulk Order",
    helpful: 37,
  },
  {
    name: "Meera Banerjee",
    location: "Kolkata",
    text: "The attention to detail is what keeps me coming back. From the ribbon colour matching the occasion to the quality of products inside — everything feels intentional. Sent a rakhi hamper to my brother in Gurgaon and he was genuinely surprised!",
    rating: 5,
    avatar:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Meera&backgroundColor=ffd5dc",
    date: "6 days ago",
    product: "Rakhi Special Hamper",
    helpful: 28,
  },
];

// ─── Mobile Review Card (compact) ─────────────────────────────────────────────
function MobileReviewCard({ item }: { item: (typeof reviews)[0] }) {
  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
      {/* Stars + Date */}
      <div className="flex items-center justify-between">
        <Rating
          value={item.rating}
          precision={0.5}
          readOnly
          size="small"
          sx={{ fontSize: "0.65rem" }}
        />
        <span className="text-[8px] text-gray-400">{item.date}</span>
      </div>

      {/* Product tag */}
      <span className="inline-block text-[8px] font-semibold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full mt-1.5 self-start">
        {item.product}
      </span>

      {/* Quote */}
      <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed mt-1.5 flex-1 line-clamp-4">
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Helpful */}
      <p className="text-[8px] text-gray-400 mt-1.5">
        {item.helpful} found this helpful
      </p>

      {/* Divider */}
      <div className="h-px bg-gray-100 my-2" />

      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white shadow-sm bg-gray-100">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-0.5">
            <p className="text-[9px] font-semibold text-gray-900 truncate">
              {item.name}
            </p>
            <BadgeCheck className="w-2.5 h-2.5 text-blue-500 shrink-0" />
          </div>
          <p className="text-[8px] text-gray-400 font-medium truncate">
            {item.location} · Verified
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Review Card ──────────────────────────────────────────────────────
function ReviewCard({ item }: { item: (typeof reviews)[0] }) {
  return (
    <div className="h-full flex flex-col bg-white rounded-xl lg:rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Stars + Date */}
      <div className="flex items-center justify-between">
        <Rating
          value={item.rating}
          precision={0.5}
          readOnly
          size="small"
          sx={{ fontSize: "0.8rem" }}
        />
        <span className="text-[9px] lg:text-[10px] text-gray-400 font-medium">
          {item.date}
        </span>
      </div>

      {/* Product tag */}
      <div className="mt-1.5">
        <span className="inline-block text-[9px] lg:text-[10px] font-semibold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
          {item.product}
        </span>
      </div>

      {/* Quote */}
      <p className="text-[11px] lg:text-[13px] text-gray-600 leading-relaxed mt-2 flex-1">
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Helpful */}
      <p className="text-[9px] lg:text-[10px] text-gray-400 mt-1.5">
        {item.helpful} people found this helpful
      </p>

      {/* Divider */}
      <div className="h-px bg-gray-100 my-2.5 lg:my-3" />

      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm bg-gray-100">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-[10px] lg:text-xs font-semibold text-gray-900 truncate">
              {item.name}
            </p>
            <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />
          </div>
          <p className="text-[9px] lg:text-[10px] text-gray-400 font-medium truncate">
            {item.location} · Verified Purchase
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      slidesToScroll: 1,
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section className="py-2 sm:py-3 md:py-6 lg:py-8 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* ── Header ── */}
        <div className="md:text-center mb-2.5 sm:mb-3 md:mb-5 lg:mb-7">
          {/* Mobile header */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-[15px] sm:text-base font-bold text-neutral-900">
                Customer Reviews
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Rating
                value={Number(avgRating)}
                readOnly
                precision={0.1}
                size="small"
                sx={{ fontSize: "0.6rem" }}
              />
              <span className="text-[9px] text-gray-400 font-medium">
                {avgRating}
              </span>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-neutral-900"
            >
              What Our Customers Say
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3 mt-2"
            >
              <div className="flex items-center gap-1.5">
                <Rating
                  value={Number(avgRating)}
                  readOnly
                  precision={0.1}
                  size="small"
                  sx={{ fontSize: "0.9rem" }}
                />
                <span className="text-xs lg:text-sm font-semibold text-gray-800">
                  {avgRating}
                </span>
              </div>
              <span className="text-gray-300 text-sm">|</span>
              <span className="text-xs lg:text-sm text-gray-500 font-medium">
                Based on 2,847 verified reviews
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground max-w-xl mx-auto text-xs md:text-sm font-medium mt-1.5"
            >
              Real feedback from verified buyers across India.
            </motion.p>
          </div>
        </div>

        {/* ── Mobile: continuous auto-scroll marquee ── */}
        <div className="md:hidden overflow-hidden -mx-4">
          <div
            className="flex gap-2.5 px-4 animate-marquee hover:[animation-play-state:paused]"
            style={{
              width: "max-content",
              animation: "marquee 30s linear infinite",
            }}
          >
            {/* Render cards twice for seamless loop */}
            {[...reviews, ...reviews].map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="flex-none w-[200px] sm:w-[230px]"
              >
                <MobileReviewCard item={item} />
              </div>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>

        {/* ── Desktop: carousel with arrows ── */}
        <div className="hidden md:block relative">
          <div className="mx-10 lg:mx-12">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {reviews.map((item) => (
                  <div
                    key={item.name}
                    className="flex-none w-[calc(100%/3)] px-1.5 lg:px-2"
                  >
                    <ReviewCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-gray-200 bg-white shadow-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-gray-200 bg-white shadow-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Quote decoration ── */}
        <div className="hidden md:flex justify-center mt-6 lg:mt-8">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-12 h-px bg-gray-200" />
            <Quote className="w-4 h-4 rotate-180" />
            <div className="w-12 h-px bg-gray-200" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
