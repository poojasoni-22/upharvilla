"use client";

import { useQuery } from "convex/react";
import { createContext, type ReactNode, useContext } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const WishlistContext = createContext<Id<"products">[]>([]);

/** Wrap product listing pages with this — single subscription for all cards */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const ids = useQuery(api.wishlists.getMyProductIds) ?? [];
  return (
    <WishlistContext.Provider value={ids}>{children}</WishlistContext.Provider>
  );
}

export function useWishlistIds() {
  return useContext(WishlistContext);
}
