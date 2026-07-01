import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════
// INTERNAL HELPERS (not exported to client)
// ═══════════════════════════════════════════════════════════

/** Shared validation logic — used by both query (preview) and mutation (redeem) */
async function _validateCouponInternal(
  ctx: any,
  args: {
    code: string;
    userId: string;
    cartTotal: number;
    productCategory?: string;
    productId?: Id<"products">;
  },
) {
  const now = Date.now();
  const upperCode = args.code.trim().toUpperCase();

  if (!upperCode) {
    return { valid: false as const, reason: "Please enter a coupon code." };
  }

  // 1. Find coupon
  const coupon = await ctx.db
    .query("coupons")
    .withIndex("by_code", (q: any) => q.eq("code", upperCode))
    .first();

  if (!coupon) {
    return { valid: false as const, reason: "Invalid coupon code." };
  }

  // 2. Active check
  if (!coupon.isActive) {
    return {
      valid: false as const,
      reason: "This coupon is no longer active.",
    };
  }

  // 3. Date validity
  if (now < coupon.startsAt) {
    return { valid: false as const, reason: "This coupon is not yet active." };
  }
  if (now > coupon.expiresAt) {
    return { valid: false as const, reason: "This coupon has expired." };
  }

  // 4. Global usage limit
  if (
    coupon.totalUsageLimit !== undefined &&
    coupon.currentUsageCount >= coupon.totalUsageLimit
  ) {
    return {
      valid: false as const,
      reason: "This coupon has reached its maximum usage limit.",
    };
  }

  // 5. Per-user limit (MANDATORY — userId is required)
  const userUsages = await ctx.db
    .query("couponUsages")
    .withIndex("by_user_coupon", (q: any) =>
      q.eq("userId", args.userId).eq("couponId", coupon._id),
    )
    .collect();

  if (userUsages.length >= coupon.perUserLimit) {
    return {
      valid: false as const,
      reason:
        coupon.perUserLimit === 1
          ? "You have already used this coupon."
          : `You have already used this coupon ${coupon.perUserLimit} time(s).`,
    };
  }

  // 6. Minimum order amount
  if (
    coupon.minOrderAmount !== undefined &&
    args.cartTotal < coupon.minOrderAmount
  ) {
    return {
      valid: false as const,
      reason: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required for this coupon.`,
    };
  }

  // 7. Category / product applicability
  if (coupon.applicableTo === "category" && coupon.applicableCategory) {
    if (
      args.productCategory &&
      args.productCategory !== coupon.applicableCategory
    ) {
      return {
        valid: false as const,
        reason: `This coupon is only valid for ${coupon.applicableCategory.replace(/-/g, " ")} products.`,
      };
    }
  }
  if (coupon.applicableTo === "product" && coupon.applicableProductId) {
    if (args.productId && args.productId !== coupon.applicableProductId) {
      return {
        valid: false as const,
        reason: "This coupon is only valid for a specific product.",
      };
    }
  }

  // 8. Calculate discount (server-side — never trust client)
  let discountAmount = 0;
  let message = "";

  switch (coupon.discountType) {
    case "percentage": {
      // Clamp percentage to 0-100
      const safePercent = Math.min(Math.max(coupon.discountValue, 0), 100);
      discountAmount = Math.round((args.cartTotal * safePercent) / 100);
      // Apply max discount cap
      if (
        coupon.maxDiscount !== undefined &&
        discountAmount > coupon.maxDiscount
      ) {
        discountAmount = coupon.maxDiscount;
      }
      // Never exceed cart total
      discountAmount = Math.min(discountAmount, args.cartTotal);
      message = `${safePercent}% off applied! You save ₹${discountAmount.toLocaleString("en-IN")}.`;
      break;
    }
    case "flat": {
      // Flat discount capped at cart total
      discountAmount = Math.min(
        Math.max(coupon.discountValue, 0),
        args.cartTotal,
      );
      message = `₹${discountAmount.toLocaleString("en-IN")} off applied!`;
      break;
    }
    case "free_shipping": {
      discountAmount = 0; // Shipping discount handled at checkout layer
      message = "Free shipping applied!";
      break;
    }
  }

  return {
    valid: true as const,
    couponId: coupon._id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    description: coupon.description,
    message,
  };
}

// ═══════════════════════════════════════════════════════════
// ADMIN MUTATIONS
// ═══════════════════════════════════════════════════════════

/** Admin: Create a new coupon */
export const create = mutation({
  args: {
    code: v.string(),
    description: v.string(),
    discountType: v.union(
      v.literal("percentage"),
      v.literal("flat"),
      v.literal("free_shipping"),
    ),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    applicableTo: v.union(
      v.literal("all"),
      v.literal("category"),
      v.literal("product"),
    ),
    applicableCategory: v.optional(v.string()),
    applicableProductId: v.optional(v.id("products")),
    totalUsageLimit: v.optional(v.number()),
    perUserLimit: v.number(),
    startsAt: v.number(),
    expiresAt: v.number(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const upperCode = args.code.trim().toUpperCase();

    // Validate code format (alphanumeric + hyphens/underscores, 3-30 chars)
    if (!/^[A-Z0-9_-]{3,30}$/.test(upperCode)) {
      throw new Error(
        "Coupon code must be 3-30 characters, alphanumeric with hyphens/underscores only.",
      );
    }

    // Validate dates
    if (args.expiresAt <= args.startsAt) {
      throw new Error("Expiry date must be after start date.");
    }

    // Validate percentage range
    if (
      args.discountType === "percentage" &&
      (args.discountValue <= 0 || args.discountValue > 100)
    ) {
      throw new Error("Percentage discount must be between 1 and 100.");
    }

    // Validate flat discount
    if (args.discountType === "flat" && args.discountValue <= 0) {
      throw new Error("Flat discount amount must be greater than 0.");
    }

    // Validate per-user limit
    if (args.perUserLimit < 1) {
      throw new Error("Per-user limit must be at least 1.");
    }

    // Check for duplicate code
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", upperCode))
      .first();

    if (existing) {
      throw new Error(`Coupon code "${upperCode}" already exists.`);
    }

    return await ctx.db.insert("coupons", {
      code: upperCode,
      description: args.description.trim(),
      discountType: args.discountType,
      discountValue:
        args.discountType === "free_shipping" ? 0 : args.discountValue,
      minOrderAmount: args.minOrderAmount,
      maxDiscount: args.maxDiscount,
      applicableTo: args.applicableTo,
      applicableCategory:
        args.applicableTo === "category" ? args.applicableCategory : undefined,
      applicableProductId:
        args.applicableTo === "product" ? args.applicableProductId : undefined,
      totalUsageLimit: args.totalUsageLimit,
      perUserLimit: args.perUserLimit,
      currentUsageCount: 0,
      startsAt: args.startsAt,
      expiresAt: args.expiresAt,
      isActive: true,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

/** Admin: Update a coupon (only allowed fields — currentUsageCount is NEVER patchable) */
export const update = mutation({
  args: {
    id: v.id("coupons"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discountType: v.optional(
      v.union(
        v.literal("percentage"),
        v.literal("flat"),
        v.literal("free_shipping"),
      ),
    ),
    discountValue: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    applicableTo: v.optional(
      v.union(v.literal("all"), v.literal("category"), v.literal("product")),
    ),
    applicableCategory: v.optional(v.string()),
    applicableProductId: v.optional(v.id("products")),
    totalUsageLimit: v.optional(v.number()),
    perUserLimit: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.id);
    if (!coupon) throw new Error("Coupon not found.");

    // Build patch with ONLY allowed fields (whitelist approach)
    const patch: Record<string, any> = {};

    if (args.code !== undefined) {
      const upperCode = args.code.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,30}$/.test(upperCode)) {
        throw new Error("Invalid coupon code format.");
      }
      // Check duplicate
      const existing = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", upperCode))
        .first();
      if (existing && existing._id !== args.id) {
        throw new Error(`Coupon code "${upperCode}" already exists.`);
      }
      patch.code = upperCode;
    }

    if (args.description !== undefined)
      patch.description = args.description.trim();
    if (args.discountType !== undefined) patch.discountType = args.discountType;
    if (args.discountValue !== undefined)
      patch.discountValue = args.discountValue;
    if (args.minOrderAmount !== undefined)
      patch.minOrderAmount = args.minOrderAmount;
    if (args.maxDiscount !== undefined) patch.maxDiscount = args.maxDiscount;
    if (args.applicableTo !== undefined) patch.applicableTo = args.applicableTo;
    if (args.applicableCategory !== undefined)
      patch.applicableCategory = args.applicableCategory;
    if (args.applicableProductId !== undefined)
      patch.applicableProductId = args.applicableProductId;
    if (args.totalUsageLimit !== undefined)
      patch.totalUsageLimit = args.totalUsageLimit;
    if (args.perUserLimit !== undefined) {
      if (args.perUserLimit < 1)
        throw new Error("Per-user limit must be at least 1.");
      patch.perUserLimit = args.perUserLimit;
    }
    if (args.startsAt !== undefined) patch.startsAt = args.startsAt;
    if (args.expiresAt !== undefined) patch.expiresAt = args.expiresAt;

    // Validate dates if both provided
    const finalStart = patch.startsAt ?? coupon.startsAt;
    const finalEnd = patch.expiresAt ?? coupon.expiresAt;
    if (finalEnd <= finalStart) {
      throw new Error("Expiry date must be after start date.");
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.id, patch);
    }
  },
});

/** Admin: Toggle coupon active/inactive */
export const toggleActive = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.id);
    if (!coupon) throw new Error("Coupon not found.");
    await ctx.db.patch(args.id, { isActive: !coupon.isActive });
    return !coupon.isActive;
  },
});

/** Admin: Delete a coupon and all its usage records */
export const remove = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.id);
    if (!coupon) throw new Error("Coupon not found.");

    // Delete all usage records for this coupon
    const usages = await ctx.db
      .query("couponUsages")
      .withIndex("by_coupon", (q) => q.eq("couponId", args.id))
      .collect();
    for (const usage of usages) {
      await ctx.db.delete(usage._id);
    }

    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════
// ADMIN QUERIES
// ═══════════════════════════════════════════════════════════

/** Admin: List all coupons (ordered newest first) */
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

/** Admin: Total coupon count */
export const count = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("coupons").collect();
    return all.length;
  },
});

// ═══════════════════════════════════════════════════════════
// CUSTOMER QUERIES (read-only, for UI display)
// ═══════════════════════════════════════════════════════════

/** Customer: List active, valid coupons for the "Available Offers" section */
export const listActiveForUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const validCoupons = coupons.filter(
      (c) =>
        c.startsAt <= now &&
        c.expiresAt > now &&
        (c.totalUsageLimit === undefined ||
          c.currentUsageCount < c.totalUsageLimit),
    );

    // If userId provided, annotate with whether user has already used each coupon
    if (args.userId) {
      const results = [];
      for (const coupon of validCoupons) {
        const userUsages = await ctx.db
          .query("couponUsages")
          .withIndex("by_user_coupon", (q) =>
            q.eq("userId", args.userId!).eq("couponId", coupon._id),
          )
          .collect();
        results.push({
          ...coupon,
          userHasUsed: userUsages.length >= coupon.perUserLimit,
          userUsageCount: userUsages.length,
        });
      }
      return results;
    }

    return validCoupons.map((c) => ({
      ...c,
      userHasUsed: false,
      userUsageCount: 0,
    }));
  },
});

/**
 * Customer: Preview coupon validation (read-only query for "Apply" button feedback).
 * This is NOT the source of truth — actual enforcement happens in `redeemCoupon` mutation.
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
    userId: v.string(), // REQUIRED — no anonymous validation
    cartTotal: v.number(),
    productCategory: v.optional(v.string()),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    return await _validateCouponInternal(ctx, args);
  },
});

// ═══════════════════════════════════════════════════════════
// CUSTOMER MUTATION — ATOMIC REDEEM (the real enforcement)
// ═══════════════════════════════════════════════════════════

/**
 * Atomically validate + record coupon usage in a single mutation.
 * This is the ONLY way a coupon gets redeemed. Called at checkout time.
 *
 * Convex mutations are serialized per-document, so this prevents
 * race conditions where two requests try to use the same coupon.
 */
export const redeemCoupon = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    cartTotal: v.number(),
    orderId: v.optional(v.id("orders")),
    productCategory: v.optional(v.string()),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    // Re-validate everything inside the mutation (single atomic transaction)
    const result = await _validateCouponInternal(ctx, {
      code: args.code,
      userId: args.userId,
      cartTotal: args.cartTotal,
      productCategory: args.productCategory,
      productId: args.productId,
    });

    if (!result.valid) {
      throw new Error(result.reason);
    }

    // Record usage (server-computed discountAmount — never trust client)
    await ctx.db.insert("couponUsages", {
      couponId: result.couponId,
      userId: args.userId,
      orderId: args.orderId,
      discountAmount: result.discountAmount,
      usedAt: Date.now(),
    });

    // Atomically increment usage count
    const coupon = await ctx.db
      .query("coupons")
      .filter((q) => q.eq(q.field("_id"), result.couponId))
      .first();
    if (coupon) {
      await ctx.db.patch(coupon._id, {
        currentUsageCount: coupon.currentUsageCount + 1,
      });
    }

    return {
      couponId: result.couponId,
      code: result.code,
      discountType: result.discountType,
      discountAmount: result.discountAmount,
      message: result.message,
    };
  },
});
