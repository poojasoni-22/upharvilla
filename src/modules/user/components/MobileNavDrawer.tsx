"use client";

import {
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

interface SubCategory {
  heading: string;
  links: string[];
}

interface NavItem {
  title: string;
  categories?: SubCategory[];
}

const navItems: NavItem[] = [
  {
    title: "Customized Gifts",
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
  },
  {
    title: "Corporate Gifts",
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
  },
  {
    title: "Trending Gifts",
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
  },
  {
    title: "Hampers",
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
  },
  {
    title: "Shop by Occasion",
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
  },
];

export default function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -ml-1 text-neutral-700"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-[360px] p-0 flex flex-col bg-white"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="upharVilla"
                width={993}
                height={294}
                sizes="100px"
                className="h-7 w-auto object-contain"
              />
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Search for gifts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Navigation accordion */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick links */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-2.5 text-sm font-semibold text-neutral-800"
            >
              All Products
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>

          {/* Category accordion */}
          <div className="divide-y divide-neutral-100">
            {navItems.map((item) => {
              const isExpanded = expanded === item.title;

              return (
                <div key={item.title}>
                  {/* Accordion trigger */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : item.title)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold text-neutral-800 active:bg-neutral-50 transition-colors min-h-[48px]"
                  >
                    {item.title}
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion content */}
                  {isExpanded && item.categories && (
                    <div className="bg-neutral-50/70 px-4 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.categories.map((cat) => (
                        <div key={cat.heading} className="mb-3 last:mb-0">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 px-1">
                            {cat.heading}
                          </p>
                          <div className="flex flex-col">
                            {cat.links.map((link) => (
                              <Link
                                key={link}
                                href={`/products?tag=${encodeURIComponent(link)}`}
                                onClick={() => setOpen(false)}
                                className="py-2 px-2 text-[13px] text-neutral-600 hover:text-primary active:bg-neutral-100 rounded-lg transition-colors min-h-[40px] flex items-center"
                              >
                                {link}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-neutral-100 px-4 py-4 bg-neutral-50/50">
          {session ? (
            <div className="space-y-4">
              {/* User profile card */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {session.user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-semibold text-neutral-700 hover:text-primary transition-colors min-h-[40px]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account</span>
                </Link>
                <Link
                  href="/my-orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-semibold text-neutral-700 hover:text-primary transition-colors min-h-[40px]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-semibold text-neutral-700 hover:text-primary transition-colors min-h-[40px]"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await authClient.signOut();
                    router.push("/");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-50/50 border border-red-100 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer min-h-[40px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="w-full block bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-xl text-center active:scale-[0.98] transition-all"
            >
              Sign In / Create Account
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
