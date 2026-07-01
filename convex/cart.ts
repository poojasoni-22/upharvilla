import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/* ─── Limits ─────────────────────────────────────────────────────────────── */
const CART_LIMIT = 25; // max total items (sum of quantities) in cart
const SAVE_LIMIT = 20; // max items in saved-for-later list

/* ═══════════════════════════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════════════════════════ */

export const addToCart = mutation({
  args: { productId: v.id("products"), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in to manage your cart");
    const userId = identity.subject as Id<"user">;

    // ── Enforce cart limit ──────────────────────────────────────────────
    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const currentTotal = cartItems.reduce((s, i) => s + i.quantity, 0);
    if (currentTotal + args.quantity > CART_LIMIT) {
      throw new Error(
        `Cart limit reached! You can have at most ${CART_LIMIT} items in your cart.`,
      );
    }

    // ── Add or update ───────────────────────────────────────────────────
    const existing = await ctx.db
      .query("carts")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    if (existing) {
      // Would the new total exceed limit?
      if (
        currentTotal - existing.quantity + existing.quantity + args.quantity >
        CART_LIMIT
      ) {
        throw new Error(`Cart is limited to ${CART_LIMIT} items.`);
      }
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return { added: true, updated: true };
    } else {
      await ctx.db.insert("carts", {
        userId,
        productId: args.productId,
        quantity: args.quantity,
        createdAt: Date.now(),
      });
      return { added: true, updated: false };
    }
  },
});

export const updateQuantity = mutation({
  args: { cartItemId: v.id("carts"), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in");
    const userId = identity.subject as Id<"user">;

    const existing = await ctx.db.get(args.cartItemId);
    if (!existing || existing.userId !== userId)
      throw new Error("Cart item not found or unauthorized");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      // Enforce cart limit on increases
      if (args.quantity > existing.quantity) {
        const allItems = await ctx.db
          .query("carts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();
        const currentTotal = allItems.reduce((s, i) => s + i.quantity, 0);
        const diff = args.quantity - existing.quantity;
        if (currentTotal + diff > CART_LIMIT) {
          throw new Error(`Cart is limited to ${CART_LIMIT} items.`);
        }
      }
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("carts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in");
    const userId = identity.subject as Id<"user">;

    const existing = await ctx.db.get(args.cartItemId);
    if (!existing || existing.userId !== userId)
      throw new Error("Cart item not found or unauthorized");
    await ctx.db.delete(args.cartItemId);
  },
});

export const getCartItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;

    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const populated = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;
        return {
          _id: item._id,
          productId: item.productId,
          quantity: item.quantity,
          product,
        };
      }),
    );
    return populated.filter((p) => p !== null) as NonNullable<
      (typeof populated)[0]
    >[];
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const userId = identity.subject as Id<"user">;

    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   SAVED FOR LATER
═══════════════════════════════════════════════════════════════════════════ */

export const getSavedItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"user">;

    const saved = await ctx.db
      .query("savedForLater")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const populated = await Promise.all(
      saved.map(async (s) => {
        const product = await ctx.db.get(s.productId);
        if (!product) return null;
        return {
          _id: s._id,
          productId: s.productId,
          createdAt: s.createdAt,
          product,
        };
      }),
    );
    return populated.filter(Boolean) as NonNullable<(typeof populated)[0]>[];
  },
});

export const saveForLater = mutation({
  args: { cartItemId: v.id("carts") },
  handler: async (ctx, { cartItemId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const cartItem = await ctx.db.get(cartItemId);
    if (!cartItem || cartItem.userId !== userId)
      throw new Error("Item not found");

    // ── Enforce save limit ──────────────────────────────────────────────
    const savedCount = (
      await ctx.db
        .query("savedForLater")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    ).length;

    if (savedCount >= SAVE_LIMIT) {
      throw new Error(`You can save at most ${SAVE_LIMIT} items for later.`);
    }

    // ── Avoid duplicates ────────────────────────────────────────────────
    const alreadySaved = await ctx.db
      .query("savedForLater")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", cartItem.productId),
      )
      .first();

    if (!alreadySaved) {
      await ctx.db.insert("savedForLater", {
        userId,
        productId: cartItem.productId,
        createdAt: Date.now(),
      });
    }

    // Remove from cart
    await ctx.db.delete(cartItemId);
    return { saved: true };
  },
});

export const moveToCart = mutation({
  args: { savedItemId: v.id("savedForLater") },
  handler: async (ctx, { savedItemId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const savedItem = await ctx.db.get(savedItemId);
    if (!savedItem || savedItem.userId !== userId)
      throw new Error("Item not found");

    // ── Enforce cart limit ──────────────────────────────────────────────
    const cartItems = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const cartTotal = cartItems.reduce((s, i) => s + i.quantity, 0);

    if (cartTotal >= CART_LIMIT) {
      throw new Error(
        `Cart is full! You can have at most ${CART_LIMIT} items. Remove something first.`,
      );
    }

    // ── Add back to cart ────────────────────────────────────────────────
    const inCart = await ctx.db
      .query("carts")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", savedItem.productId),
      )
      .first();

    if (inCart) {
      await ctx.db.patch(inCart._id, { quantity: inCart.quantity + 1 });
    } else {
      await ctx.db.insert("carts", {
        userId,
        productId: savedItem.productId,
        quantity: 1,
        createdAt: Date.now(),
      });
    }

    await ctx.db.delete(savedItemId);
    return { moved: true };
  },
});

export const removeSavedItem = mutation({
  args: { savedItemId: v.id("savedForLater") },
  handler: async (ctx, { savedItemId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;

    const item = await ctx.db.get(savedItemId);
    if (!item || item.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(savedItemId);
  },
});
