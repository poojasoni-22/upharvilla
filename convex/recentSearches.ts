import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const HISTORY_LIMIT = 5;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;

    return await ctx.db
      .query("recentSearches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(HISTORY_LIMIT);
  },
});

export const recordSearch = mutation({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject as Id<"user">;
    const searchTerm = args.query.trim().toLowerCase();

    if (!searchTerm) return null;

    // Check if duplicate query exists
    const existing = await ctx.db
      .query("recentSearches")
      .withIndex("by_user_query", (q) =>
        q.eq("userId", userId).eq("query", searchTerm),
      )
      .first();

    if (existing) {
      // Update timestamp to float it to top
      await ctx.db.patch(existing._id, { createdAt: Date.now() });
      return existing._id;
    } else {
      // Fetch all to cap history limit
      const searches = await ctx.db
        .query("recentSearches")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      if (searches.length >= HISTORY_LIMIT) {
        // Sort oldest first and delete the excess
        searches.sort((a, b) => a.createdAt - b.createdAt);
        const toDeleteCount = searches.length - HISTORY_LIMIT + 1;
        for (let i = 0; i < toDeleteCount; i++) {
          await ctx.db.delete(searches[i]._id);
        }
      }

      const searchId = await ctx.db.insert("recentSearches", {
        userId,
        query: searchTerm,
        createdAt: Date.now(),
      });
      return searchId;
    }
  },
});

export const removeSearch = mutation({
  args: { id: v.id("recentSearches") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Search history item not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const searches = await ctx.db
      .query("recentSearches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const s of searches) {
      await ctx.db.delete(s._id);
    }
  },
});
