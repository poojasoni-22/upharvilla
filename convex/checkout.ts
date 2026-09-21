import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { incrementCounter } from "./counterUtils";
import { env } from "./env";

// ── Razorpay Signature Verification ─────────────────────────────────────────
// Runs server-side only. Uses constant-time comparison to prevent timing attacks.
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const text = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(text),
  );
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison — prevents timing side-channel attacks
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

const RESERVATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const PLATFORM_FEE = 9; // ₹9 — defined once server-side, never from client
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CHECKOUT_ATTEMPTS_PER_WINDOW = 5; // Max pending orders created per 10m window

// ── Internal: Check Checkout Rate Limit ───────────────────────────────────
// Anti-carding & anti-bot protection: throttles rapid/uncompleted checkout sessions.
export const _checkCheckoutRateLimit = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const pendingSessions = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "pending"),
      )
      .collect();

    // Count pending (uncompleted) attempts created in the current window
    const recentPending = pendingSessions.filter(
      (s) => s.createdAt > windowStart,
    );

    if (recentPending.length >= MAX_CHECKOUT_ATTEMPTS_PER_WINDOW) {
      return {
        allowed: false,
        reason:
          "Too many payment attempts. Please wait a few minutes before trying again.",
      };
    }

    return { allowed: true };
  },
});

// ── Internal: Fetch active reservations with product data ─────────────────
// Used by createRazorpayOrder action to compute the authoritative price.
export const _getReservationsWithProducts = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const _now = Date.now();
    const uid = args.userId as Id<"user">;

    const valid = await ctx.db
      .query("reservations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", uid).eq("status", "reserved"),
      )
      .collect();

    return await Promise.all(
      valid.map(async (r) => {
        const product = await ctx.db.get(r.productId);
        return { ...r, product };
      }),
    );
  },
});

// ── Internal: Create Checkout Session ──────────────────────────────────────
// Tracks Razorpay orders independently of reservations.
// Security: verifies user ownership and expected amount in completeCheckout.
export const _createCheckoutSession = internalMutation({
  args: {
    userId: v.string(),
    razorpayOrderId: v.string(),
    expectedAmountPaise: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("checkoutSessions", {
      userId: args.userId,
      razorpayOrderId: args.razorpayOrderId,
      expectedAmountPaise: args.expectedAmountPaise,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// ── Reserve Stock ─────────────────────────────────────────────────────────
export const reserveStock = mutation({
  args: {
    productId: v.optional(v.string()),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in to checkout");
    const userId = identity.subject as Id<"user">;

    let cartItems: { productId: Id<"products">; quantity: number }[] = [];

    if (args.productId) {
      const prodId = args.productId as Id<"products">;
      // Single product checkout (Buy Now)
      const cartItem = await ctx.db
        .query("carts")
        .withIndex("by_user_and_product", (q) =>
          q.eq("userId", userId).eq("productId", prodId),
        )
        .first();

      const qty = args.quantity || cartItem?.quantity || 1;
      cartItems = [{ productId: prodId, quantity: qty }];
    } else {
      // All cart items checkout
      const dbCarts = await ctx.db
        .query("carts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      cartItems = dbCarts.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
      }));
    }

    if (cartItems.length === 0) throw new Error("Your cart is empty");

    const now = Date.now();

    // 2. Release ALL existing "reserved" reservations for this user —
    // including already-expired ones, so they don't pollute future getActiveReservations queries.
    const existingReservations = await ctx.db
      .query("reservations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("status", "reserved"),
      )
      .collect();

    for (const res of existingReservations) {
      await ctx.db.patch(res._id, { status: "released" });
    }
    const createdReservations = [];

    // 3. Verify stock availability and create new reservations
    for (const item of cartItems) {
      const product = await ctx.db.get(item.productId);
      if (!product?.isActive) {
        throw new Error(
          "One or more products in your cart are no longer available",
        );
      }

      // Validate quantity is sane
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        throw new Error(`Invalid quantity for "${product.name}"`);
      }

      // Count other users' active, unexpired reservations on this product
      const competingReservations = await ctx.db
        .query("reservations")
        .withIndex("by_product_active", (q) =>
          q
            .eq("productId", item.productId)
            .eq("status", "reserved")
            .gt("expiresAt", now),
        )
        .collect();

      const reservedQty = competingReservations
        .filter((r) => r.userId !== userId)
        .reduce((sum, r) => sum + r.quantity, 0);

      const availableStock = product.stock - reservedQty;

      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Only ${Math.max(0, availableStock)} available.`,
        );
      }

      const resId = await ctx.db.insert("reservations", {
        userId,
        productId: item.productId,
        quantity: item.quantity,
        expiresAt: now + RESERVATION_EXPIRY_MS,
        status: "reserved",
      });

      createdReservations.push({
        _id: resId,
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    return createdReservations;
  },
});

// ── Get Active Reservations (public query for UI) ─────────────────────────
export const getActiveReservations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject as Id<"user">;
    const now = Date.now();

    // Only fetch reservations that haven't expired yet.
    // The index supports range queries on expiresAt after equality on userId+status.
    const valid = await ctx.db
      .query("reservations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("status", "reserved").gt("expiresAt", now),
      )
      .collect();
    if (valid.length === 0) return null;

    const populated = await Promise.all(
      valid.map(async (r) => {
        const product = await ctx.db.get(r.productId);
        return {
          _id: r._id,
          productId: r.productId,
          quantity: r.quantity,
          expiresAt: r.expiresAt,
          timeLeftMs: Math.max(0, r.expiresAt - now),
          product,
        };
      }),
    );

    return populated.filter((p) => p.product !== null);
  },
});

// ── Create Razorpay Order ──────────────────────────────────────────────────
// SECURITY: Amount is NEVER taken from the client.
// The server fetches the user's locked reservations from the DB,
// reads prices from the product records, and computes the total itself.
// Coupon discount is validated server-side and applied to the total.
export const createRazorpayOrder = action({
  args: {
    couponCode: v.optional(v.string()), // optional coupon code
  },
  handler: async (ctx, args) => {
    // ── Auth ────────────────────────────────────────────────────────────────
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You must be logged in to checkout");
    const userId = identity.subject;

    // ── Velocity / Anti-Bot Rate Limit Check ──────────────────────────────
    const rateCheck = await ctx.runQuery(
      internal.checkout._checkCheckoutRateLimit,
      { userId },
    );
    if (!rateCheck.allowed) {
      throw new Error(
        rateCheck.reason ||
          "Too many payment attempts. Please wait a few minutes before trying again.",
      );
    }

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    // ── Fetch reservations + DB prices (server-side only) ──────────────────
    const reservations = await ctx.runQuery(
      internal.checkout._getReservationsWithProducts,
      { userId },
    );

    if (!reservations || reservations.length === 0) {
      throw new Error(
        "No active stock reservation. Please start checkout again.",
      );
    }

    // ── Compute authoritative total from DB product prices ─────────────────
    let totalPrice = 0;
    for (const item of reservations) {
      if (!item.product) {
        throw new Error("A reserved product no longer exists in the database");
      }
      totalPrice += item.product.price * item.quantity;
    }

    // ── Validate coupon server-side (preview only — actual redeem at completeCheckout) ──
    let couponDiscount = 0;
    if (args.couponCode) {
      const couponResult = await ctx.runQuery(
        internal.checkout._validateCouponForCheckout,
        { code: args.couponCode, userId, cartTotal: totalPrice },
      );
      if (couponResult.valid) {
        couponDiscount = couponResult.discountAmount;
      }
      // If invalid, silently ignore — the user will see the full price
    }

    const finalAmountRupees =
      Math.max(0, totalPrice - couponDiscount) + PLATFORM_FEE;

    // ── Create order on Razorpay with server-computed amount ───────────────
    const base64Auth = btoa(`${keyId}:${keySecret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64Auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(finalAmountRupees * 100), // paise
        currency: "INR",
        receipt: `rcpt_${crypto
          .randomUUID()
          .replace(/-/g, "")
          .substring(0, 16)
          .toUpperCase()}`,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Razorpay Order API failed: ${errBody}`);
    }

    const order = await response.json();

    // ── Store checkout session for payment verification ────────────────────
    const amountPaise = Math.round(finalAmountRupees * 100);
    await ctx.runMutation(internal.checkout._createCheckoutSession, {
      userId,
      razorpayOrderId: order.id,
      expectedAmountPaise: amountPaise,
    });

    return {
      id: order.id as string,
      amount: order.amount as number, // paise — used by Razorpay modal
      currency: order.currency as string,
      couponDiscount, // inform the client of the discount applied
    };
  },
});

// ── Internal: Validate coupon for checkout (used by createRazorpayOrder) ──
export const _validateCouponForCheckout = internalQuery({
  args: {
    code: v.string(),
    userId: v.string(),
    cartTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upperCode = args.code.trim().toUpperCase();
    if (!upperCode) return { valid: false as const, discountAmount: 0 };

    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", upperCode))
      .first();

    if (!coupon?.isActive) return { valid: false as const, discountAmount: 0 };
    if (now < coupon.startsAt || now > coupon.expiresAt)
      return { valid: false as const, discountAmount: 0 };
    if (
      coupon.totalUsageLimit !== undefined &&
      coupon.currentUsageCount >= coupon.totalUsageLimit
    )
      return { valid: false as const, discountAmount: 0 };

    // Per-user limit check
    const userUsages = await ctx.db
      .query("couponUsages")
      .withIndex("by_user_coupon", (q) =>
        q.eq("userId", args.userId).eq("couponId", coupon._id),
      )
      .collect();
    if (userUsages.length >= coupon.perUserLimit)
      return { valid: false as const, discountAmount: 0 };

    // Min order
    if (
      coupon.minOrderAmount !== undefined &&
      args.cartTotal < coupon.minOrderAmount
    )
      return { valid: false as const, discountAmount: 0 };

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      const pct = Math.min(Math.max(coupon.discountValue, 0), 100);
      discountAmount = Math.round((args.cartTotal * pct) / 100);
      if (
        coupon.maxDiscount !== undefined &&
        discountAmount > coupon.maxDiscount
      ) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discountAmount = Math.min(
        Math.max(coupon.discountValue, 0),
        args.cartTotal,
      );
    }
    // free_shipping: discountAmount stays 0 (shipping handled separately)

    return { valid: true as const, discountAmount, couponId: coupon._id };
  },
});

// ── Complete Checkout ──────────────────────────────────────────────────────
export const completeCheckout = mutation({
  args: {
    addressId: v.id("addresses"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
    couponCode: v.optional(v.string()), // coupon to redeem atomically
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"user">;
    const now = Date.now();

    // ── Idempotency Guard ──────────────────────────────────────────────────
    // Network retries cannot create a second order for the same payment.
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_razorpay_order", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId),
      )
      .first();

    if (existingOrder) {
      // Anti-replay: reject if this order belongs to a different user
      if (existingOrder.userId !== userId) {
        throw new Error("This payment does not belong to your account.");
      }
      return existingOrder._id; // safe idempotent return
    }

    // ── Razorpay HMAC-SHA256 Signature Verification (server-side) ──────────
    const keySecret = env.RAZORPAY_KEY_SECRET;

    const verified = await verifyRazorpaySignature(
      args.razorpayOrderId,
      args.razorpayPaymentId,
      args.razorpaySignature,
      keySecret,
    );

    if (!verified) {
      throw new Error(
        "Payment verification failed: invalid Razorpay signature.",
      );
    }

    // ── Fetch this user's active reservations ──────────────────────────────
    const validReservations = await ctx.db
      .query("reservations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("status", "reserved"),
      )
      .collect();

    if (validReservations.length === 0) {
      throw new Error(
        "Your reservation lock has expired. Please check out again.",
      );
    }

    // ── Checkout Session Verification ─────────────────────────────────────
    // Verify the Razorpay order was created by our server for this user,
    // and that the expected amount matches the recalculated cart total.
    const checkoutSession = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_razorpay_order", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId),
      )
      .first();

    if (!checkoutSession) {
      throw new Error("Invalid checkout session. Please try again.");
    }
    if (checkoutSession.userId !== userId) {
      throw new Error("This payment does not belong to your account.");
    }
    if (checkoutSession.status === "completed") {
      // Session already completed — idempotency guard should have caught this above
      throw new Error("This checkout session has already been completed.");
    }

    // ── Address ownership check ────────────────────────────────────────────
    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Invalid shipping address.");
    }

    // ── Server-side total recalculation from DB prices ─────────────────────
    // The amount stored in the order record is ALWAYS computed here from the
    // product table — the client never has authority over the price.
    const orderItems = [];
    let totalPrice = 0;

    for (const res of validReservations) {
      const product = await ctx.db.get(res.productId);
      if (!product) throw new Error("A reserved product no longer exists.");

      if (product.stock < res.quantity) {
        throw new Error(`Insufficient warehouse stock for "${product.name}".`);
      }

      // Decrement stock
      await ctx.db.patch(res.productId, {
        stock: product.stock - res.quantity,
      });

      // Mark reservation completed
      await ctx.db.patch(res._id, { status: "completed" });

      totalPrice += product.price * res.quantity;

      orderItems.push({
        productId: res.productId,
        name: product.name,
        price: product.price,
        quantity: res.quantity,
        thumbnail: product.thumbnail,
      });
    }

    // ── Server-side coupon redemption (atomic — inside the same mutation) ───
    let couponDiscount = 0;
    if (args.couponCode) {
      const upperCode = args.couponCode.trim().toUpperCase();
      if (upperCode) {
        const coupon = await ctx.db
          .query("coupons")
          .withIndex("by_code", (q) => q.eq("code", upperCode))
          .first();

        if (
          coupon?.isActive &&
          now >= coupon.startsAt &&
          now <= coupon.expiresAt
        ) {
          // Check usage limits
          const globalOk =
            coupon.totalUsageLimit === undefined ||
            coupon.currentUsageCount < coupon.totalUsageLimit;
          const userUsages = await ctx.db
            .query("couponUsages")
            .withIndex("by_user_coupon", (q) =>
              q.eq("userId", userId).eq("couponId", coupon._id),
            )
            .collect();
          const userOk = userUsages.length < coupon.perUserLimit;
          const minOk =
            coupon.minOrderAmount === undefined ||
            totalPrice >= coupon.minOrderAmount;

          if (globalOk && userOk && minOk) {
            // Calculate discount
            if (coupon.discountType === "percentage") {
              const pct = Math.min(Math.max(coupon.discountValue, 0), 100);
              couponDiscount = Math.round((totalPrice * pct) / 100);
              if (
                coupon.maxDiscount !== undefined &&
                couponDiscount > coupon.maxDiscount
              ) {
                couponDiscount = coupon.maxDiscount;
              }
            } else if (coupon.discountType === "flat") {
              couponDiscount = Math.min(
                Math.max(coupon.discountValue, 0),
                totalPrice,
              );
            }
            // free_shipping: couponDiscount stays 0

            couponDiscount = Math.min(couponDiscount, totalPrice); // never exceed total

            // Record usage atomically
            await ctx.db.insert("couponUsages", {
              couponId: coupon._id,
              userId,
              discountAmount: couponDiscount,
              usedAt: now,
            });

            // Increment counter
            await ctx.db.patch(coupon._id, {
              currentUsageCount: coupon.currentUsageCount + 1,
            });
          }
        }
      }
    }

    const finalAmount = Math.max(0, totalPrice - couponDiscount) + PLATFORM_FEE;

    // ── Amount verification (prevents cart-swap fraud) ──────────────────────
    // Ensures the amount paid matches what was calculated when the Razorpay
    // order was created. Blocks: pay ₹100 → swap cart to ₹5000 → complete.
    const recalculatedPaise = Math.round(finalAmount * 100);
    if (recalculatedPaise !== checkoutSession.expectedAmountPaise) {
      throw new Error(
        "Your cart has changed since payment was initiated. Please checkout again.",
      );
    }

    // ── Create order record ────────────────────────────────────────────────
    const orderId = await ctx.db.insert("orders", {
      userId,
      addressId: args.addressId,
      items: orderItems,
      totalAmount: finalAmount,
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      paymentStatus: "paid",
      orderStatus: "placed",
      createdAt: now,
    });

    await incrementCounter(ctx, "orders");

    // ── Mark checkout session as completed ──────────────────────────────────
    await ctx.db.patch(checkoutSession._id, { status: "completed" });

    // ── Clear only the checked-out items from the cart ─────────────────────────
    for (const res of validReservations) {
      const cartItem = await ctx.db
        .query("carts")
        .withIndex("by_user_and_product", (q) =>
          q.eq("userId", userId).eq("productId", res.productId),
        )
        .first();
      if (cartItem) {
        await ctx.db.delete(cartItem._id);
      }
    }

    // ── Fire emails (fire-and-forget — never blocks checkout) ──────────────────
    const formattedAddress = `${address.fullName}, ${address.address}, ${address.city}, ${address.state} – ${address.pincode}`;

    if (identity.email) {
      // Customer: order confirmation
      await ctx.scheduler.runAfter(
        0,
        internal.emails.orderEmail.sendOrderConfirmation,
        {
          customerEmail: identity.email,
          customerName: address.fullName,
          orderId: orderId as string,
          razorpayPaymentId: args.razorpayPaymentId,
          items: orderItems.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            thumbnail: i.thumbnail,
          })),
          totalAmount: finalAmount,
          address: formattedAddress,
        },
      );

      // Admin: new order notification
      await ctx.scheduler.runAfter(
        0,
        internal.emails.adminEmail.notifyAdminNewOrder,
        {
          orderId: orderId as string,
          customerName: address.fullName,
          customerEmail: identity.email,
          items: orderItems.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            thumbnail: i.thumbnail,
          })),
          totalAmount: finalAmount,
          address: formattedAddress,
        },
      );
    }

    // ── WhatsApp order confirmation (fire-and-forget) ──────────────────────────
    // Use the delivery address phone number directly — no separate opt-in needed
    const waPhone = address.phone.startsWith("+")
      ? address.phone
      : `+91${address.phone.replace(/^0+/, "")}`;

    if (waPhone.length >= 12) {
      // Build items summary for rich message
      const itemsSummary = orderItems
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(", ");
      const firstThumbnail = orderItems[0]?.thumbnail || "";

      await ctx.scheduler.runAfter(
        0,
        internal.whatsapp.orderNotifications.sendOrderConfirmationWhatsApp,
        {
          phone: waPhone,
          customerName: address.fullName,
          orderId: orderId as string,
          totalAmount: finalAmount,
          itemsSummary,
          thumbnailUrl: firstThumbnail,
        },
      );
    }

    // Trigger calculation of most sold products asynchronously
    await ctx.scheduler.runAfter(0, internal.products.recalculateMostSold, {});

    return orderId;
  },
});

// ── Release Reservations ───────────────────────────────────────────────────
export const releaseReservations = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject as Id<"user">;

    const now = Date.now();
    const activeRes = await ctx.db
      .query("reservations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("status", "reserved").gt("expiresAt", now),
      )
      .collect();

    for (const res of activeRes) {
      await ctx.db.patch(res._id, { status: "released" });
    }
  },
});

// ── Database Garbage Collection / Cleanup ────────────────────────────────────
/**
 * Periodically deletes expired/released reservations and stale abandoned carts
 * to keep the database clean and minimize storage utilization.
 * Called daily by Convex Crons.
 */
export const purgeStaleDatabaseRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // 1. Purge reservations that expired more than 24 hours ago (resolved or abandoned)
    const staleReservations = await ctx.db
      .query("reservations")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", oneDayAgo))
      .collect();

    for (const res of staleReservations) {
      await ctx.db.delete(res._id);
    }

    // 2. Purge abandoned carts older than 30 days
    const oldCarts = await ctx.db
      .query("carts")
      .withIndex("by_created_at", (q) => q.lt("createdAt", thirtyDaysAgo))
      .collect();

    for (const cart of oldCarts) {
      await ctx.db.delete(cart._id);
    }

    // 3. Purge stale checkout sessions older than 24 hours (abandoned bot attempts or incomplete checkouts)
    const staleSessions = await ctx.db
      .query("checkoutSessions")
      .filter((q) => q.lt(q.field("createdAt"), oneDayAgo))
      .collect();

    for (const session of staleSessions) {
      await ctx.db.delete(session._id);
    }
  },
});
