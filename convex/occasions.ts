import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOccasions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("occasionLinks")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

export const createOccasion = mutation({
  args: {
    label: v.string(),
    slug: v.string(),
    icon: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("occasionLinks", {
      label: args.label,
      slug: args.slug,
      icon: args.icon,
      link: args.link,
      sortOrder: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const deleteOccasion = mutation({
  args: { id: v.id("occasionLinks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─── Navbar Occasions ────────────────────────────────────────────────────────
export const getNavbarOccasions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("navbarOccasions")
      .withIndex("by_sort_order")
      .order("asc")
      .collect();
  },
});

export const createNavbarOccasion = mutation({
  args: {
    heading: v.string(),
    label: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("navbarOccasions", {
      heading: args.heading,
      label: args.label,
      link: args.link,
      sortOrder: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const deleteNavbarOccasion = mutation({
  args: { id: v.id("navbarOccasions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
