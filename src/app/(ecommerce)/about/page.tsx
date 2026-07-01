import { Gift, Heart, Truck, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — upharVilla | Curated Gifting from Navsari, Gujarat",
  description:
    "upharVilla is a curated gifting brand from Navsari, Gujarat. We handcraft premium hampers, personalized gifts, and corporate gifting solutions for every occasion.",
  openGraph: {
    title: "About Us — upharVilla",
    description:
      "Handcrafted gifting solutions for every occasion. Discover the story behind upharVilla.",
    type: "website",
  },
};

const values = [
  {
    icon: Heart,
    title: "Handcrafted with Love",
    description:
      "Every gift is assembled by hand with attention to detail, ensuring a premium unboxing experience your loved ones will remember.",
  },
  {
    icon: Gift,
    title: "Personalized Touch",
    description:
      "From engraved keepsakes to custom hampers, we believe a gift should tell a story unique to the person receiving it.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description:
      "We deliver across India with care-packed shipments, ensuring your gift arrives pristine — no matter the distance.",
  },
  {
    icon: Users,
    title: "Corporate Gifting",
    description:
      "Trusted by businesses for employee welcome kits, client appreciation hampers, and festival gifting at scale.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#faf9ff]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#ad8de9] to-[#c4aaff] text-white">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] bg-white/20 px-4 py-1.5 rounded-full inline-block mb-6">
            Our Story
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight max-w-3xl mx-auto">
            Making Every Occasion <span className="italic">Special</span>
          </h1>
          <p className="mt-5 text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            upharVilla was born from a simple belief — the best gifts are the
            ones that feel personal. We curate premium hampers and personalized
            gifts that turn everyday moments into lasting memories.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Who We Are
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-800 leading-snug">
              A Small-Town Dream with a Big Vision
            </h2>
            <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                Based in{" "}
                <strong className="text-neutral-800">Navsari, Gujarat</strong>,
                upharVilla started as a passion project — a desire to make
                gifting effortless and meaningful in an age of generic options.
              </p>
              <p>
                What began as curating hampers for friends and family quickly
                grew into a full-fledged gifting brand trusted by hundreds of
                customers across India. From custom photo frames and resin art
                to premium chocolate hampers and personalized engraving — we do
                it all.
              </p>
              <p>
                We work with local artisans and small-batch suppliers to bring
                you products that are not just beautiful, but responsibly made.
                Every order supports the local economy and keeps traditional
                craftsmanship alive.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
              <Image
                src="/logo.png"
                alt="upharVilla brand"
                width={400}
                height={500}
                sizes="(max-width: 768px) 80vw, 400px"
                className="w-full h-full object-contain p-12"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 md:-left-8 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 sm:p-5">
              <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                500+
              </p>
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                Happy Customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-14 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              What Drives Us
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold font-serif text-neutral-800">
              Our Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="p-6 md:p-8 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-primary/[0.02] hover:border-primary/15 transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="bg-gradient-to-br from-primary via-[#ad8de9] to-[#c4aaff] rounded-3xl p-8 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-3">
              Have a Gifting Idea in Mind?
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto mb-8">
              Tell us what you&apos;re looking for and we&apos;ll craft a
              personalized gift that&apos;s truly one-of-a-kind.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-primary rounded-full text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className="px-8 py-3 bg-white/15 text-white rounded-full text-sm font-bold hover:bg-white/25 transition-colors border border-white/20"
              >
                Browse Gifts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
