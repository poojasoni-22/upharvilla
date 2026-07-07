import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { components } from "./_generated/api";

export const syncUserCreated = internalMutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    // Avoid duplicates
    const existing = await ctx.db
      .query("user")
      .withIndex("email_name", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!existing) {
      await ctx.db.insert("user", {
        name: args.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        emailVerified: args.emailVerified,
        image: args.image ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: args.id,
      });
    }
  },
});

export const syncUserUpdated = internalMutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("user")
      .withIndex("email_name", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        emailVerified: args.emailVerified,
        image: args.image ?? existing.image,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user", {
        name: args.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        emailVerified: args.emailVerified,
        image: args.image ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: args.id,
      });
    }
  },
});

// Backfill existing users from better-auth tables to main user table
export const backfillUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const usersResult = await ctx.runQuery(components.betterAuth.adapter.findMany as any, {
      model: "user",
      paginationOpts: {
        numItems: 1000,
        cursor: null,
      },
    });

    let count = 0;
    for (const u of usersResult.page) {
      const user = u as any;
      const normalizedEmail = user.email?.trim().toLowerCase();
      if (!normalizedEmail) continue;

      const existing = await ctx.db
        .query("user")
        .withIndex("email_name", (q) => q.eq("email", normalizedEmail))
        .first();

      if (!existing) {
        await ctx.db.insert("user", {
          name: user.name || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          emailVerified: user.emailVerified ?? false,
          image: user.image ?? null,
          createdAt: user.createdAt || Date.now(),
          updatedAt: user.updatedAt || Date.now(),
          userId: user.id || user.userId || null,
        });
        count++;
      }
    }
    return { success: true, backfilledCount: count };
  },
});
