"use client";

import { useQuery } from "convex/react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { api } from "../../../../convex/_generated/api";

interface SubCategory {
  heading: string;
  links: string[];
}

interface NavItem {
  title: string;
  hasDropdown: boolean;
  categorySlug?: string; // maps to the database category field
  align?: "left" | "center" | "right";
  categories?: SubCategory[];
  images?: {
    src: string;
    alt: string;
    label: string;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Customized Gifts",
    hasDropdown: true,
    categorySlug: "customized-gifts",
    align: "left",
    categories: [
      {
        heading: "Keepsakes & Photos",
        links: ["Customized Photo Gifts", "Customized Couple Gifts"],
      },
      {
        heading: "Style & Fashion",
        links: ["Customized Jewelry", "Customized Fashion Gifts"],
      },
      {
        heading: "Home & Lifestyle",
        links: [
          "Customized Home Decor",
          "Customized Drinkware",
          "Customized Kids Gifts",
        ],
      },
    ],
    images: [
      {
        src: "/category-personalised.webp",
        alt: "Customized Prints",
        label: "Personalized Prints",
      },
      {
        src: "/category-corporate.webp",
        alt: "Customized Couple Gifts",
        label: "Customized Couple Gifts",
      },
    ],
  },
  {
    title: "Corporate Gifts",
    hasDropdown: true,
    categorySlug: "corporate-gifts",
    align: "left",
    categories: [
      {
        heading: "Employee & Teams",
        links: [
          "Employee Welcome Kits",
          "Employee Appreciation Gifts",
          "Work From Home Gifts",
        ],
      },
      {
        heading: "Client & Executive",
        links: ["Client Gifts", "Executive Gifts", "Customized Branding Gifts"],
      },
      {
        heading: "Special Collections",
        links: [
          "Eco-Friendly Gifts",
          "Office Desk Essentials",
          "Festive Corporate Gifts",
        ],
      },
    ],
    images: [
      {
        src: "/nav-corporate-welcome.webp",
        alt: "Customized Items",
        label: "Corporate Welcome Kits",
      },
      {
        src: "/nav-corporate-gift-kit.webp",
        alt: "Corporate Gift Kits",
        label: "Corporate Gift Kits",
      },
    ],
  },
  {
    title: "Trending Gifts",
    hasDropdown: true,
    categorySlug: "__flag:trending",
    align: "center",
    categories: [
      {
        heading: "Popular Hits",
        links: ["Viral & Bestselling Gifts", "Instagram-Worthy Gifts"],
      },
      {
        heading: "Featured",
        links: ["Spotify Gifts", "Seasonal Trending Gifts"],
      },
      {
        heading: "More Collections",
        links: ["Mini Budget Gifts", "New Arrivals"],
      },
    ],
    images: [
      {
        src: "/nav-exclusive-bouquet.webp",
        alt: "Eclusive Bouquets",
        label: "Eclusive Bouquets",
      },
      {
        src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80",
        alt: "Aesthetic lights",
        label: "Aesthetic Ambient Lights",
      },
    ],
  },
  {
    title: "Hampers",
    hasDropdown: true,
    categorySlug: "hampers",
    align: "center",
    categories: [
      {
        heading: "Celebration Hampers",
        links: ["Birthday Hampers", "Wedding Hampers", "Couple Hampers"],
      },
      {
        heading: "Festive & Professional",
        links: ["Festive Hampers", "Corporate Hampers"],
      },
      {
        heading: "Specialty Hampers",
        links: ["Luxury Hampers", "Baby & Kids Hampers", "Customized Hampers"],
      },
    ],
    images: [
      {
        src: "/nav-gourmet-hamper.webp",
        alt: "Gourmet Hamper",
        label: "Lux Gourmet Baskets",
      },
      {
        src: "/nav-signature-hamper.webp",
        alt: "Gift Hamper Set",
        label: "Signature Hampers",
      },
    ],
  },
  {
    title: "Shop by Occasion",
    hasDropdown: true,
    categorySlug: "shop-by-occasion",
    align: "right",
    categories: [
      {
        heading: "Milestones",
        links: ["Birthday", "Anniversary", "Wedding", "Engagement"],
      },
      {
        heading: "Love & Family",
        links: [
          "Valentine's Day",
          "Mother's Day",
          "Father's Day",
          "Baby Shower & Newborn",
        ],
      },
      {
        heading: "Festive & Events",
        links: [
          "Raksha Bandhan",
          "Graduation & Achievement",
          "Festivals & Celebrations",
        ],
      },
    ],
    images: [
      {
        src: "/nav-valentine-love.webp",
        alt: "Valentine Red Theme",
        label: "Valentine's & Love",
      },
      {
        src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&auto=format&fit=crop&q=80",
        alt: "Anniversary Champagne Gift",
        label: "Milestone Anniversaries",
      },
    ],
  },
  {
    title: "New Arrivals",
    hasDropdown: false,
  },
];

// ─── Auto-categorize occasion slugs into navbar heading groups ───────────────
const SLUG_TO_HEADING: Record<string, string> = {
  // Milestones
  birthday: "Milestones",
  anniversary: "Milestones",
  wedding: "Milestones",
  engagement: "Milestones",
  graduation: "Milestones",
  retirement: "Milestones",
  "baby-shower": "Milestones",
  // Love & Family
  "valentines-day": "Love & Family",
  "mothers-day": "Love & Family",
  "fathers-day": "Love & Family",
  "womens-day": "Love & Family",
  "karwa-chauth": "Love & Family",
  "bhai-dooj": "Love & Family",
  "friendship-day": "Love & Family",
  "childrens-day": "Love & Family",
  "teachers-day": "Love & Family",
  // Festive & Events
  rakhi: "Festive & Events",
  diwali: "Festive & Events",
  holi: "Festive & Events",
  christmas: "Festive & Events",
  "new-year": "Festive & Events",
  eid: "Festive & Events",
  navratri: "Festive & Events",
  onam: "Festive & Events",
  pongal: "Festive & Events",
  lohri: "Festive & Events",
  "ganesh-chaturthi": "Festive & Events",
  housewarming: "Festive & Events",
  // Sentiments
  "thank-you": "Sentiments",
  congratulations: "Sentiments",
  "get-well-soon": "Sentiments",
  sorry: "Sentiments",
};

export const Navigation = () => {
  // Controlled open state — set to "" to instantly close all menus
  const [openItem, setOpenItem] = useState("");

  const closeMenu = () => setOpenItem("");

  // ── Pull from homepage occasion tabs (single source of truth) ──
  const dbOccasions = useQuery(api.occasions.getOccasions);

  const occasionCategories = (() => {
    const occasions = dbOccasions && dbOccasions.length > 0 ? dbOccasions : [];
    const headings = [
      "Milestones",
      "Love & Family",
      "Festive & Events",
      "Sentiments",
    ];

    return headings
      .map((heading) => {
        const links = occasions
          .filter(
            (o) => (SLUG_TO_HEADING[o.slug] || "Festive & Events") === heading,
          )
          .map((o) => ({
            label: o.label,
            link: o.link || `/products?tag=${encodeURIComponent(o.slug)}`,
          }));
        return { heading, links };
      })
      .filter((cat) => cat.links.length > 0);
  })();

  // Mobile-specific state
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

  // Get categories for a given nav item (handling "Shop by Occasion" specially)
  const getCategoriesForItem = (item: NavItem) => {
    if (item.title === "Shop by Occasion") return occasionCategories;
    return item.categories;
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE NAV — Custom click-based horizontal scroll tabs + dropdown
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden relative">
        {/* Continuous scrolling category tabs */}
        <div ref={mobileScrollRef} className="overflow-hidden py-1">
          <style>{`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marquee-scroll 20s linear infinite;
            }
            .marquee-track:hover,
            .marquee-track.paused {
              animation-play-state: paused;
            }
          `}</style>
          <div
            className={`marquee-track ${mobileOpen ? "paused" : ""}`}
            onTouchStart={(e) => e.currentTarget.classList.add("paused")}
            onTouchEnd={(e) => {
              if (!mobileOpen) e.currentTarget.classList.remove("paused");
            }}
          >
            {/* Render items twice for seamless loop */}
            {[0, 1].map((setIdx) =>
              navItems.map((item) => {
                const isActive = mobileOpen === item.title;

                return item.hasDropdown ? (
                  <button
                    key={`${setIdx}-${item.title}`}
                    type="button"
                    onClick={() => setMobileOpen(isActive ? null : item.title)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 flex-none ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-neutral-700 active:bg-neutral-100"
                    }`}
                  >
                    {item.title}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    key={`${setIdx}-${item.title}`}
                    href="/new-arrivals"
                    className="px-3 py-1.5 text-[13px] font-medium text-neutral-700 whitespace-nowrap flex-none active:bg-neutral-100 rounded-full transition-colors"
                  >
                    {item.title}
                  </Link>
                );
              }),
            )}
          </div>
        </div>

        {/* Mobile dropdown overlay */}
        {mobileOpen &&
          (() => {
            const activeItem = navItems.find((i) => i.title === mobileOpen);
            if (!activeItem) return null;
            const cats = getCategoriesForItem(activeItem);

            return (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
                  onClick={() => setMobileOpen(null)}
                />

                {/* Dropdown panel */}
                <div
                  className="fixed left-2 right-2 z-50 bg-white rounded-xl shadow-2xl border border-neutral-200 animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-[65vh] overflow-y-auto"
                  style={{
                    top:
                      (mobileScrollRef.current?.getBoundingClientRect()
                        .bottom ?? 120) + 4,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 sticky top-0 bg-white rounded-t-xl z-10">
                    <h3 className="text-[13px] font-bold text-neutral-900">
                      {activeItem.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(null)}
                      className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>

                  {/* Subcategory groups — 2-col links under full-width headings */}
                  <div className="px-3 pt-2 pb-1">
                    {cats?.map((cat, idx) => (
                      <div
                        key={cat.heading}
                        className={
                          idx > 0
                            ? "mt-2.5 pt-2 border-t border-neutral-100"
                            : ""
                        }
                      >
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 pl-0.5 border-l-2 border-primary/40 pl-2">
                          {cat.heading}
                        </p>
                        <div className="grid grid-cols-2 gap-x-3">
                          {cat.links.map((subItem) => {
                            const label =
                              typeof subItem === "string"
                                ? subItem
                                : subItem.label;
                            const href =
                              typeof subItem === "string"
                                ? activeItem.categorySlug
                                  ? activeItem.categorySlug.startsWith(
                                      "__flag:",
                                    )
                                    ? `/products?flag=${activeItem.categorySlug.replace("__flag:", "")}&tag=${encodeURIComponent(subItem)}`
                                    : `/products?category=${activeItem.categorySlug}&tag=${encodeURIComponent(subItem)}`
                                  : `/products?tag=${encodeURIComponent(subItem)}`
                                : subItem.link;
                            const isLong = label.length > 18;
                            return (
                              <Link
                                key={label}
                                href={href}
                                onClick={() => setMobileOpen(null)}
                                className={`block py-[5px] text-[12px] text-neutral-700 hover:text-primary active:text-primary transition-colors ${isLong ? "col-span-2" : ""}`}
                              >
                                {label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View all link */}
                  <div className="px-3 pb-2.5">
                    <Link
                      href={
                        activeItem.categorySlug
                          ? activeItem.categorySlug.startsWith("__flag:")
                            ? `/products?flag=${activeItem.categorySlug.replace("__flag:", "")}`
                            : `/products?category=${activeItem.categorySlug}`
                          : `/products?tag=${encodeURIComponent(activeItem.title)}`
                      }
                      onClick={() => setMobileOpen(null)}
                      className="block w-full text-center text-[12px] font-semibold text-primary border border-primary/20 bg-primary/5 rounded-lg py-2 hover:bg-primary/10 transition-colors"
                    >
                      View All {activeItem.title} →
                    </Link>
                  </div>
                </div>
              </>
            );
          })()}
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP NAV — Existing Radix hover-based NavigationMenu
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex justify-center w-full">
        <NavigationMenu
          viewport={false}
          className="w-full justify-center"
          value={openItem}
          onValueChange={setOpenItem}
        >
          <NavigationMenuList className="flex gap-1 md:gap-1 lg:gap-6 xl:gap-8 items-center justify-center">
            {navItems.map((item) => (
              <NavigationMenuItem
                key={item.title}
                value={item.title}
                className={item.hasDropdown ? "static!" : ""}
              >
                {item.hasDropdown ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:text-primary text-[11px] md:text-xs lg:text-sm xl:text-base font-medium px-1 md:px-1.5 lg:px-3 xl:px-4 py-1 whitespace-nowrap transition-colors cursor-pointer data-[state=open]:text-primary">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white! border border-neutral-200 shadow-2xl rounded-xl p-4 md:p-5 lg:p-7 xl:p-10 z-50 md:absolute! md:w-[min(95vw,750px)]! lg:w-[min(92vw,1000px)]! xl:w-[1100px]! top-[calc(100%+14px)]! left-1/2! -translate-x-1/2! grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      {/* Columns of sublinks */}
                      <div className="col-span-7 grid grid-cols-3 gap-3 md:gap-4 lg:gap-5 xl:gap-6 border-r-2 border-primary/20 pr-4 md:pr-5 lg:pr-6 xl:pr-8">
                        {getCategoriesForItem(item)?.map((cat) => (
                          <div
                            key={cat.heading}
                            className="flex flex-col gap-1.5 md:gap-2 lg:gap-3 border-r border-neutral-300 pr-2 md:pr-3 lg:pr-4 last:border-r-0 last:pr-0"
                          >
                            <h4 className="text-[10px] md:text-xs lg:text-sm font-semibold text-primary uppercase tracking-wider">
                              {cat.heading}
                            </h4>
                            <div className="flex flex-col gap-1 md:gap-1.5 lg:gap-2.5">
                              {cat.links.map((subItem) => {
                                const label =
                                  typeof subItem === "string"
                                    ? subItem
                                    : subItem.label;
                                const href =
                                  typeof subItem === "string"
                                    ? item.categorySlug
                                      ? item.categorySlug.startsWith("__flag:")
                                        ? `/products?flag=${item.categorySlug.replace("__flag:", "")}&tag=${encodeURIComponent(subItem)}`
                                        : `/products?category=${item.categorySlug}&tag=${encodeURIComponent(subItem)}`
                                      : `/products?tag=${encodeURIComponent(subItem)}`
                                    : subItem.link;
                                return (
                                  <NavigationMenuLink asChild key={label}>
                                    <Link
                                      href={href}
                                      onClick={closeMenu}
                                      className="group/sublink text-[11px] md:text-xs lg:text-sm text-neutral-700 hover:text-black flex items-center justify-between w-full transition-all duration-200"
                                    >
                                      <span className="group-hover/sublink:underline decoration-neutral-850 decoration-1 underline-offset-4">
                                        {label}
                                      </span>
                                      <ChevronRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-neutral-600 opacity-0 -translate-x-1 group-hover/sublink:opacity-100 group-hover/sublink:translate-x-0 transition-all duration-250" />
                                    </Link>
                                  </NavigationMenuLink>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Image / Banner columns */}
                      <div className="col-span-5 flex gap-2 md:gap-3 lg:gap-4 h-[160px] md:h-[200px] lg:h-[250px] xl:h-[280px]">
                        {item.images?.map((img, idx) => (
                          <NavigationMenuLink asChild key={idx}>
                            <Link
                              href={
                                item.categorySlug
                                  ? item.categorySlug.startsWith("__flag:")
                                    ? `/products?flag=${item.categorySlug.replace("__flag:", "")}&tag=${encodeURIComponent(img.label)}`
                                    : `/products?category=${item.categorySlug}&tag=${encodeURIComponent(img.label)}`
                                  : `/products?tag=${encodeURIComponent(img.label)}`
                              }
                              onClick={closeMenu}
                              className="flex-1 relative rounded-xl overflow-hidden group/img-card shadow-md h-full block"
                            >
                              <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes="(max-width: 1024px) 50vw, 200px"
                                className="object-cover group-hover/img-card:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-2 md:p-3 lg:p-4">
                                <span className="text-white font-semibold text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider mb-0.5">
                                  {img.label}
                                </span>
                                <span className="text-neutral-300 text-[8px] md:text-[9px] lg:text-[10px] flex items-center gap-1 group-hover/img-card:text-white transition-colors">
                                  Shop Now{" "}
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link
                    href="/new-arrivals"
                    onClick={closeMenu}
                    className="hover:text-primary text-[11px] md:text-xs lg:text-sm xl:text-base font-medium px-1 md:px-1.5 lg:px-3 xl:px-4 py-1 whitespace-nowrap transition-colors cursor-pointer inline-flex items-center justify-center text-neutral-700"
                  >
                    {item.title}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
};

export default Navigation;
