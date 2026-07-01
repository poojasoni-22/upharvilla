"use client";

import { useQuery } from "convex/react";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";

const tabs = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Explore", icon: LayoutGrid, href: "/products" },
  { label: "Cart", icon: ShoppingBag, href: "/cart", badge: true },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "Account", icon: User, href: "/auth" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const cartItems = useQuery(
    api.cart.getCartItems,
    session ? undefined : "skip",
  );
  const cartCount = cartItems?.length ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ label, icon: Icon, href, badge }) => {
          const targetHref =
            label === "Account" ? (session ? "/account" : "/auth") : href;
          const isActive =
            targetHref === "/"
              ? pathname === "/"
              : pathname.startsWith(targetHref);

          return (
            <Link
              key={label}
              href={targetHref}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] relative transition-colors ${
                isActive ? "text-primary" : "text-neutral-500"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                }`}
              />
              <span
                className={`text-[10px] leading-tight ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {label}
              </span>

              {/* Cart badge */}
              {badge && cartCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-1">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
