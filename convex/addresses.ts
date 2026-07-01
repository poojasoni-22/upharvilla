import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ── Get all addresses for the logged-in user ──────────────────────────────
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;
    return await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Add a new address ─────────────────────────────────────────────────────
export const add = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    alternatePhone: v.optional(v.string()),
    pincode: v.string(),
    locality: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    landmark: v.optional(v.string()),
    addressType: v.union(
      v.literal("home"),
      v.literal("work"),
      v.literal("other"),
    ),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    // If new address is default, unset others
    if (args.isDefault) {
      const existing = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const addr of existing) {
        if (addr.isDefault) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("addresses", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Set an address as default ─────────────────────────────────────────────
export const setDefault = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, { addressId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const all = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const addr of all) {
      await ctx.db.patch(addr._id, { isDefault: addr._id === addressId });
    }
  },
});

// ── Delete an address ─────────────────────────────────────────────────────
export const remove = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, { addressId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;
    const addr = await ctx.db.get(addressId);
    if (!addr || addr.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(addressId);
  },
});
