import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalQuery, mutation, query } from "./_generated/server";

// ── Get WhatsApp preferences for the current user ────────────────────────────
export const getWhatsAppPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject as Id<"user">;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile
      ? {
          whatsappPhone: profile.whatsappPhone || "",
          whatsappOptIn: profile.whatsappOptIn || false,
        }
      : { whatsappPhone: "", whatsappOptIn: false };
  },
});

// ── Save WhatsApp preferences ────────────────────────────────────────────────
export const saveWhatsAppPreferences = mutation({
  args: {
    whatsappPhone: v.string(), // E.164 format: "+919876543210"
    whatsappOptIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    // Validate phone format if opting in
    if (args.whatsappOptIn && args.whatsappPhone) {
      const phone = args.whatsappPhone.trim();
      // Must be E.164: starts with + followed by 10-15 digits
      if (!/^\+\d{10,15}$/.test(phone)) {
        throw new Error(
          "Invalid phone number format. Use E.164 format: +919876543210",
        );
      }
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        whatsappPhone: args.whatsappPhone.trim(),
        whatsappOptIn: args.whatsappOptIn,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        whatsappPhone: args.whatsappPhone.trim(),
        whatsappOptIn: args.whatsappOptIn,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ── Internal: Get WhatsApp profile by userId (for backend dispatchers) ───────
export const _getWhatsAppProfile = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile?.whatsappPhone || !profile?.whatsappOptIn) return null;

    return {
      phone: profile.whatsappPhone,
      optIn: profile.whatsappOptIn,
    };
  },
});
