"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useWishlistIds } from "@/lib/wishlist-context";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface WishlistButtonProps {
  productId: Id<"products">;
  className?: string;
  iconClassName?: string;
}

export const WishlistButton = ({
  productId,
  className,
  iconClassName,
}: WishlistButtonProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Uses context — 1 subscription for ALL cards, not 1-per-card
  const wishlistIds = useWishlistIds();
  const inWishlist = wishlistIds.includes(productId);

  const toggleWishlist = useMutation(api.wishlists.toggle);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthLoading) {
      toast.info("Please wait, loading authentication state...");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/auth");
      return;
    }

    try {
      setIsLoading(true);
      const result = await toggleWishlist({ productId });
      if (result.added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (_error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "p-1.5 md:p-2 bg-white/80 backdrop-blur-sm rounded-full transition-colors duration-300",
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:text-primary",
        inWishlist ? "text-red-500" : "text-foreground/70",
        className,
      )}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 active:scale-75",
          iconClassName,
          // Color always takes priority — applied last so it overrides iconClassName's text color
          inWishlist ? "fill-current text-red-500" : "",
        )}
      />
    </button>
  );
};

export default WishlistButton;
