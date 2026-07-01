"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Personalised Gifts",
    image: "/category-personalised.webp",
  },
  {
    name: "Anniversary",
    image: "/category-anniversary.webp",
  },
  {
    name: "Birthday",
    image: "/category-birthday.webp",
  },
  {
    name: "Corporate Gifts",
    image: "/category-corporate.webp",
  },
  {
    name: "Custom Hampers",
    image: "/category-custom-hampers.webp",
  },
  {
    name: "Trending Gifts",
    image: "/category-trending.webp",
  },
];

const categoryLinks: Record<string, string> = {
  "Personalised Gifts": "/products?tag=Customized Photo Gifts",
  Anniversary: "/products?tag=Anniversary",
  Birthday: "/products?tag=Birthday",
  "Corporate Gifts": "/products?tag=Employee Welcome Kits",
  "Custom Hampers": "/products?tag=Customized Hampers",
  "Trending Gifts": "/products?tag=Viral & Bestselling Gifts",
};

export const Categories = () => {
  return (
    <section className="py-4 sm:py-5 md:py-6 lg:py-10 xl:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center mb-2.5 sm:mb-3 md:mb-5 lg:mb-8">
          <h2 className="text-[15px] sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold md:font-semibold tracking-tight mb-1.5 md:mb-3 text-center">
            Shop by Category
          </h2>
          <div className="h-0.5 sm:h-1 md:h-1.5 w-10 sm:w-14 md:w-20 lg:w-24 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-8 xl:gap-10">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={categoryLinks[category.name] || "/products"}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
                  {/* Randomish shaped container for image */}
                  <motion.div
                    className="relative aspect-square overflow-hidden bg-primary/10 border border-primary/30 shadow-sm transition-all duration-500 rounded-xl lg:rounded-2xl group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:border-primary/30 group-hover:bg-primary/[0.08]"
                    style={{
                      borderRadius:
                        index % 2 === 0
                          ? "12px 40px 12px 40px"
                          : "40px 12px 40px 12px",
                    }}
                    whileHover={{
                      borderRadius:
                        index % 2 === 0
                          ? "40px 12px 40px 12px"
                          : "12px 40px 12px 40px",
                      scale: 1.05,
                    }}
                  >
                    <div className="absolute inset-1.5 sm:inset-2 md:inset-3 lg:inset-4">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 200px"
                        className="object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Subtle purple tint on hover */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>

                  {/* Background decorative shape */}
                  <div className="absolute -inset-2 bg-[#c88ee8]/5 rounded-[2rem] -z-10 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
                </div>

                <div className="text-center">
                  <h3 className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-black transition-colors duration-300 group-hover:text-[#c88ee8]">
                    {category.name}
                  </h3>
                  <motion.div className="h-0.5 w-0 bg-[#c88ee8] mx-auto mt-0.5 sm:mt-1 transition-all duration-300 group-hover:w-8 sm:group-hover:w-10 md:group-hover:w-12" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
