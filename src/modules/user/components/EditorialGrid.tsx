"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_SLOTS = {
  slot1: {
    image: "/editorial-hamper-gift.png",
    altText: "Shop Hampers",
    visitLink: "/products?tag=Customized Hampers",
    label: "SHOP HAMPERS",
  },
  slot2: {
    image: "/editorial-photo-frame.png",
    altText: "Shop Frames",
    visitLink: "/products?tag=Customized Photo Gifts",
    label: "SHOP FRAMES",
  },
  slot3: {
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=600&h=600&fit=crop&auto=format",
    altText: "Shop Necklaces",
    visitLink: "/products?tag=Customized Jewelry",
    label: "SHOP NECKLACES",
  },
  slot4: {
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&h=600&fit=crop&auto=format",
    altText: "Shop Earrings",
    visitLink: "/products?tag=Customized Jewelry",
    label: "SHOP EARRINGS",
  },
  slot5: {
    image:
      "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=600&h=900&fit=crop&auto=format",
    altText: "Shop Charms",
    visitLink: "/products?tag=Customized Jewelry",
    label: "SHOP CHARMS",
  },
};

const EditorialGrid = () => {
  const slots = DEFAULT_SLOTS;

  const GridItem = ({ slot, className }: { slot: any; className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5 }}
      className={`relative group overflow-hidden bg-muted ${className}`}
    >
      <Link
        href={slot.visitLink || "#"}
        className="block w-full h-full relative"
      >
        <Image
          src={slot.image}
          alt={slot.altText}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center p-6">
          <div className="text-center">
            <span className="text-white text-xs tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 block bg-black/40 backdrop-blur-sm py-2 px-4 rounded-full">
              {slot.label || "EXPLORE MORE"}
            </span>
            {/* Fallback label if not on hover for mobile or visible design */}
            {!slot.label && (
              <span className="text-white text-xs tracking-widest font-light drop-shadow-md">
                DISCOVER
              </span>
            )}
            {slot.label && (
              <span className="text-white text-sm tracking-[0.3em] font-serif uppercase drop-shadow-lg group-hover:hidden">
                {slot.label}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <section className="py-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[500px]">
        {/* Slot 1: Left Tall */}
        <GridItem
          slot={slots.slot1}
          className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3 h-[300px] md:h-full rounded-lg"
        />

        {/* Slot 2: Middle Top Wide */}
        <GridItem
          slot={slots.slot2}
          className="md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-2 h-[200px] md:h-full rounded-lg"
        />

        {/* Slot 3: Middle Bottom Left */}
        <GridItem
          slot={slots.slot3}
          className="md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-3 h-[200px] md:h-full rounded-lg"
        />

        {/* Slot 4: Middle Bottom Right */}
        <GridItem
          slot={slots.slot4}
          className="md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3 h-[200px] md:h-full rounded-lg"
        />

        {/* Slot 5: Right Tall */}
        <GridItem
          slot={slots.slot5}
          className="md:col-start-4 md:col-end-5 md:row-start-1 md:row-end-3 h-[300px] md:h-full rounded-lg"
        />
      </div>
    </section>
  );
};

export default EditorialGrid;
