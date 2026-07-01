import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const HISTORY_LIMIT = 10;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;

    const views = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(15);

    // Resolve product references and filter out deleted/inactive ones
    const populated = await Promise.all(
      views.map(async (v) => {
        const product = await ctx.db.get(v.productId);
        if (!product?.isActive) return null;
        return product;
      }),
    );

    // Deduplicate and filter nulls, limit to history limit
    const uniqueMap = new Map();
    for (const p of populated) {
      if (p && !uniqueMap.has(p._id)) {
        uniqueMap.set(p._id, p);
      }
    }

    return Array.from(uniqueMap.values()).slice(0, HISTORY_LIMIT);
  },
});

export const recordView = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject as Id<"user">;

    // Check if duplicate product view exists
    const existing = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    if (existing) {
      // Update timestamp to float it to top
      await ctx.db.patch(existing._id, { createdAt: Date.now() });
      return existing._id;
    } else {
      // Fetch all to cap history limit
      const views = await ctx.db
        .query("recentlyViewed")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      if (views.length >= 15) {
        // Sort oldest first and delete excess
        views.sort((a, b) => a.createdAt - b.createdAt);
        const toDeleteCount = views.length - 15 + 1;
        for (let i = 0; i < toDeleteCount; i++) {
          await ctx.db.delete(views[i]._id);
        }
      }

      const viewId = await ctx.db.insert("recentlyViewed", {
        userId,
        productId: args.productId,
        createdAt: Date.now(),
      });
      return viewId;
    }
  },
});
