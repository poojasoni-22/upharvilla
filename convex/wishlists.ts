import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to manage your wishlist");
    }

    const userId = identity.subject as Id<"user">;

    // Check if it's already in the wishlist
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    } else {
      await ctx.db.insert("wishlists", {
        userId,
        productId: args.productId,
        createdAt: Date.now(),
      });
      return { added: true };
    }
  },
});

export const check = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const userId = identity.subject as Id<"user">;

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    return !!existing;
  },
});

/** Returns all wishlisted product IDs for the current user — 1 query for all cards */
export const getMyProductIds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;

    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return items.map((i) => i.productId);
  },
});

export const getUserWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject as Id<"user">;

    const wishlists = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Populate the products
    const products = await Promise.all(
      wishlists.map(async (wishlist) => {
        const product = await ctx.db.get(wishlist.productId);
        return product;
      }),
    );

    // Filter out nulls if a product was deleted but wishlist item remained
    return products.filter((p) => p !== null) as NonNullable<
      (typeof products)[0]
    >[];
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const userId = identity.subject as Id<"user">;

    const wishlists = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return wishlists.length;
  },
});
