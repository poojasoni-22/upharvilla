import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBanner = mutation({
  args: {
    imageLink: v.string(),
    altText: v.optional(v.string()),
    visitLink: v.string(),
  },
  handler: async (ctx, args) => {
    const bannerId = await ctx.db.insert("heroBanners", {
      imageLink: args.imageLink,
      altText: args.altText,
      visitLink: args.visitLink,
      createdAt: Date.now(),
    });
    return bannerId;
  },
});

export const getBanners = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("heroBanners")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

export const deleteBanner = mutation({
  args: { id: v.id("heroBanners") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
