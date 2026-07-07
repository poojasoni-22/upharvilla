"use client";

import { useQuery } from "convex/react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../../convex/_generated/api";
import { LocationSelector } from "./LocationSelector";
import MobileNavDrawer from "./MobileNavDrawer";
import { SearchBar } from "./SearchBar";
import { UserButton } from "./UserButton";

export const Header = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  // Skip queries when not authenticated to avoid unnecessary backend calls
  const wishlistCount =
    useQuery(api.wishlists.count, session ? undefined : "skip") ?? 0;
  const cartCount = useQuery(api.cart.count, session ? undefined : "skip") ?? 0;

  return (
    <div className="bg-white py-2 px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex items-center justify-between gap-2">
      {/* Left: Hamburger (mobile) + Logo + Location (desktop) */}
      <div
        className={`items-center gap-2 md:gap-6 ${mobileSearchOpen ? "hidden md:flex" : "flex"}`}
      >
        {/* Mobile hamburger menu */}
        <MobileNavDrawer />

        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={993}
            height={294}
            sizes="150px"
            className="w-[100px] md:w-[130px] lg:w-[150px] h-auto object-contain"
          />
        </Link>

        {/* Desktop only: separator + location */}
        <Separator orientation="vertical" className="h-10! hidden md:block" />
        <div className="hidden md:block">
          <LocationSelector />
        </div>
      </div>

      {/* Center: Search bar — desktop only */}
      <div className="hidden md:block flex-1 max-w-sm lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl px-2 lg:px-4">
        <SearchBar />
      </div>

      {/* Right Area (Icons + Auth on desktop, dynamic expand on mobile) */}
      <div className="flex-1 md:flex-none flex items-center justify-end gap-1 sm:gap-2 md:gap-4 lg:gap-5">
        {mobileSearchOpen ? (
          /* Mobile expanded search input in place of right icons */
          <div className="flex md:hidden flex-1 items-center gap-2 px-1">
            <SearchBar onClose={() => setMobileSearchOpen(false)} />
          </div>
        ) : (
          <>
            {/* Mobile search toggle */}
            <Button
              type="button"
              size="icon-lg"
              variant="ghost"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden relative min-h-[44px] min-w-[44px] text-neutral-700 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6!" />
            </Button>

            {/* Wishlist — icon only on mobile */}
            <Link href="/wishlist" className="hidden sm:block">
              <Button
                size="icon-lg"
                variant="ghost"
                className="relative text-neutral-700 hover:text-primary transition-colors md:h-8 md:w-8 lg:h-10 lg:w-10"
              >
                <Heart className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button
                size="icon-lg"
                variant="ghost"
                className="relative min-h-[44px] min-w-[44px] md:min-h-[32px] md:min-w-[32px] lg:min-h-[40px] lg:min-w-[40px] text-neutral-700 hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-5 w-5 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth buttons */}
            {session ? (
              <div className="hidden md:flex items-center">
                <UserButton />
              </div>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" onClick={() => router.push("/auth")}>
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => router.push("/auth?mode=signup")}
                  >
                    Join Now
                  </Button>
                </div>
                {/* Mobile/Tablet Auth Button */}
                <div className="md:hidden flex items-center">
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary h-8 px-3 text-xs font-semibold rounded-lg active:scale-95 transition-all"
                    onClick={() => router.push("/auth")}
                  >
                    Sign In
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
