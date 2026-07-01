"use client";

import { useQuery } from "convex/react";
import { HeartCrack } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import ProductCard from "@/modules/user/components/ProductCard";
import { api } from "../../../../convex/_generated/api";

export default function WishlistPage() {
  const { data: session, isPending } = authClient.useSession();
  const wishlistProducts = useQuery(api.wishlists.getUserWishlist);

  const activeWishlist = (wishlistProducts || []).filter(
    (product) => product?.isActive,
  );

  if (isPending || wishlistProducts === undefined) {
    return (
      <div className="flex-1 bg-background">
        <section className="py-5 md:py-10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-5 md:space-y-10">
            <div className="text-center space-y-2 md:space-y-4">
              <div className="h-7 md:h-9 w-40 md:w-52 bg-neutral-100 rounded-lg mx-auto animate-pulse" />
              <div className="h-4 md:h-5 w-64 md:w-80 bg-neutral-100 rounded mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="max-w-[220px] space-y-2">
                  <div className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
                  <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-4 md:space-y-6 min-h-[60vh]">
        <HeartCrack className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/30" />
        <div className="space-y-1.5 md:space-y-2">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">
            Sign In to View Wishlist
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm md:text-lg font-medium tracking-wide">
            You need to be logged in to save and view your favorite products.
          </p>
        </div>
        <Link href="/auth">
          <Button
            size="lg"
            className="rounded-full px-6 md:px-8 mt-2 md:mt-4 text-sm md:text-base"
          >
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <section className="py-5 md:py-10 bg-transparent">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-5 md:space-y-10">
          <div className="text-center space-y-2 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block relative"
            >
              <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold underline underline-offset-8">
                My Wishlist
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground max-w-2xl font-mono mx-auto text-xs md:text-base lg:text-lg font-medium tracking-wide"
            >
              {activeWishlist.length > 0
                ? `You have ${activeWishlist.length} ${activeWishlist.length === 1 ? "item" : "items"} saved in your wishlist.`
                : "Explore our collections and save your favorite pieces here."}
            </motion.p>
          </div>

          {activeWishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 md:py-20 text-center space-y-4 md:space-y-6 bg-muted/30 rounded-2xl md:rounded-3xl border border-dashed border-border/50 max-w-3xl mx-auto px-4"
            >
              <HeartCrack className="w-14 h-14 md:w-24 md:h-24 text-muted-foreground/30" />
              <div className="space-y-1.5 md:space-y-2">
                <h2 className="text-lg md:text-2xl font-semibold text-foreground">
                  Your Wishlist is Empty
                </h2>
                <p className="text-muted-foreground font-mono text-xs md:text-base">
                  Looks like you haven't added anything to your wishlist yet.
                </p>
              </div>
              <Link href="/">
                <Button
                  size="lg"
                  className="rounded-full px-6 md:px-8 mt-2 md:mt-4 text-sm md:text-base"
                >
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 lg:gap-6">
              {activeWishlist.map((product, index) => (
                <motion.div
                  key={product?._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="max-w-[220px]"
                >
                  {product && <ProductCard product={product} />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
