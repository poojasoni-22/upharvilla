import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction, internalQuery } from "../_generated/server";
import { env } from "../env";
import type { WhatsAppTemplateComponent } from "./whatsappClient";

const BASE_URL = env.SITE_URL;

// ── Helper: Build body component parameters ──────────────────────────────────
function bodyParams(...texts: string[]): WhatsAppTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: texts.map((t) => ({ type: "text" as const, text: t })),
    },
  ];
}

// ── Helper: Build header image + body parameters ─────────────────────────────
// WhatsApp templates can have a header image (product thumbnail) + body text
function imageHeaderWithBody(
  imageUrl: string,
  ...bodyTexts: string[]
): WhatsAppTemplateComponent[] {
  const components: WhatsAppTemplateComponent[] = [];

  // Header component with product image
  if (imageUrl) {
    components.push({
      type: "header",
      parameters: [{ type: "image", image: { link: imageUrl } }],
    });
  }

  // Body component with text variables
  components.push({
    type: "body",
    parameters: bodyTexts.map((t) => ({ type: "text" as const, text: t })),
  });

  return components;
}

// ── Order Confirmation (after payment) ───────────────────────────────────────
// Includes product image and item details in the message
export const sendOrderConfirmationWhatsApp = internalAction({
  args: {
    phone: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    totalAmount: v.number(),
    // Product details for rich messages
    itemsSummary: v.optional(v.string()), // "2x Gift Hamper, 1x Photo Frame"
    thumbnailUrl: v.optional(v.string()), // First product's thumbnail
  },
  handler: async (ctx, args) => {
    const shortId = args.orderId.slice(-8).toUpperCase();

    const components = args.thumbnailUrl
      ? imageHeaderWithBody(
          args.thumbnailUrl,
          args.customerName,
          shortId,
          `₹${args.totalAmount.toLocaleString("en-IN")}`,
          args.itemsSummary || "your gifts",
        )
      : bodyParams(
          args.customerName,
          shortId,
          `₹${args.totalAmount.toLocaleString("en-IN")}`,
        );

    await ctx.runMutation(internal.whatsapp.queue.enqueue, {
      to: args.phone,
      templateName: "order_confirmed",
      languageCode: "en",
      components: JSON.stringify(components),
    });

    // Process immediately (fire-and-forget)
    await ctx.runAction(internal.whatsapp.queue.processQueue);
  },
});

// ── Order Status Updates (shipped / out_for_delivery / delivered) ─────────────
// Includes product images and details
export const sendOrderStatusWhatsApp = internalAction({
  args: {
    phone: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    status: v.union(
      v.literal("shipped"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
    ),
    itemsSummary: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shortId = args.orderId.slice(-8).toUpperCase();

    const templateMap: Record<string, string> = {
      shipped: "order_shipped",
      out_for_delivery: "order_out_for_delivery",
      delivered: "order_delivered",
    };

    const templateName = templateMap[args.status];

    // Build components with optional product image
    let components: WhatsAppTemplateComponent[];

    if (args.thumbnailUrl) {
      // Delivered template gets a review link as extra param
      components =
        args.status === "delivered"
          ? imageHeaderWithBody(
              args.thumbnailUrl,
              args.customerName,
              shortId,
              `${BASE_URL}/my-orders`,
            )
          : imageHeaderWithBody(args.thumbnailUrl, args.customerName, shortId);
    } else {
      components =
        args.status === "delivered"
          ? bodyParams(args.customerName, shortId, `${BASE_URL}/my-orders`)
          : bodyParams(args.customerName, shortId);
    }

    await ctx.runMutation(internal.whatsapp.queue.enqueue, {
      to: args.phone,
      templateName,
      languageCode: "en",
      components: JSON.stringify(components),
    });

    // Process immediately
    await ctx.runAction(internal.whatsapp.queue.processQueue);
  },
});

// ── Cart Abandonment Reminders ───────────────────────────────────────────────
export const sendCartAbandonmentReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(
      internal.whatsapp.orderNotifications._getUsersWithStaleCarts,
      {},
    );

    for (const user of users) {
      const components = user.thumbnailUrl
        ? imageHeaderWithBody(
            user.thumbnailUrl,
            user.name.split(" ")[0],
            `${BASE_URL}/cart`,
          )
        : bodyParams(user.name.split(" ")[0], `${BASE_URL}/cart`);

      await ctx.runMutation(internal.whatsapp.queue.enqueue, {
        to: user.phone,
        templateName: "cart_reminder",
        languageCode: "en",
        components: JSON.stringify(components),
      });
    }

    if (users.length > 0) {
      await ctx.runAction(internal.whatsapp.queue.processQueue);
    }

    console.log(
      `[WhatsApp] Enqueued ${users.length} cart abandonment reminders`,
    );
  },
});

// ── Internal: Get users with stale carts who opted into WhatsApp ─────────────
export const _getUsersWithStaleCarts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago

    const oldCarts = await ctx.db
      .query("carts")
      .withIndex("by_created_at", (q) => q.lt("createdAt", cutoff))
      .collect();

    const userMap = new Map<
      string,
      { userId: string; itemCount: number; firstProductId: string }
    >();
    for (const cart of oldCarts) {
      const ex = userMap.get(cart.userId);
      if (!ex) {
        userMap.set(cart.userId, {
          userId: cart.userId,
          itemCount: 1,
          firstProductId: cart.productId as string,
        });
      } else {
        ex.itemCount++;
      }
    }

    const results: Array<{
      phone: string;
      name: string;
      itemCount: number;
      thumbnailUrl: string;
    }> = [];

    for (const entry of userMap.values()) {
      // Skip users who ordered recently
      const recentOrders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", entry.userId as any))
        .collect();
      if (recentOrders.some((o) => o.createdAt > cutoff)) continue;

      // Get user's saved address with phone (use default or first)
      const userAddresses = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", entry.userId))
        .collect();
      const addr = userAddresses.find((a) => a.isDefault) || userAddresses[0];
      if (!addr?.phone) continue;

      const waPhone = addr.phone.startsWith("+")
        ? addr.phone
        : `+91${addr.phone.replace(/^0+/, "")}`;
      if (waPhone.length < 12) continue;

      // Get user name
      let user: any = null;
      try {
        user = await ctx.db.get(entry.userId as any);
      } catch {}
      if (!user) {
        user = await ctx.db
          .query("user")
          .withIndex("userId", (q) => q.eq("userId", entry.userId))
          .first();
      }

      // Get first product thumbnail
      const product = await ctx.db.get(entry.firstProductId as Id<"products">);
      const thumbnailUrl = product?.thumbnail || "";

      results.push({
        phone: waPhone,
        name: user?.name || addr.fullName || "there",
        itemCount: entry.itemCount,
        thumbnailUrl,
      });
    }
    return results;
  },
});

// ── Browse Abandonment Reminders ─────────────────────────────────────────────
export const sendBrowseAbandonmentReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(
      internal.whatsapp.orderNotifications._getUsersWithBrowseAbandonment,
      {},
    );

    for (const user of users) {
      const components = user.thumbnailUrl
        ? imageHeaderWithBody(
            user.thumbnailUrl,
            user.name.split(" ")[0],
            user.productName,
            user.productLink,
          )
        : bodyParams(
            user.name.split(" ")[0],
            user.productName,
            user.productLink,
          );

      await ctx.runMutation(internal.whatsapp.queue.enqueue, {
        to: user.phone,
        templateName: "browse_reminder",
        languageCode: "en",
        components: JSON.stringify(components),
      });
    }

    if (users.length > 0) {
      await ctx.runAction(internal.whatsapp.queue.processQueue);
    }

    console.log(
      `[WhatsApp] Enqueued ${users.length} browse abandonment reminders`,
    );
  },
});

// ── Internal: Get users who browsed but never ordered ────────────────────────
export const _getUsersWithBrowseAbandonment = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff48h = now - 48 * 60 * 60 * 1000;
    const cutoff7d = now - 7 * 24 * 60 * 60 * 1000;

    const recentlyViewed = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_created")
      .collect();

    const filteredViews = recentlyViewed.filter(
      (rv) => rv.createdAt < cutoff48h && rv.createdAt > cutoff7d,
    );

    // Group by user, take the most recent product per user
    const userProductMap = new Map<
      string,
      { userId: string; productId: string; createdAt: number }
    >();
    for (const rv of filteredViews) {
      const existing = userProductMap.get(rv.userId);
      if (!existing || rv.createdAt > existing.createdAt) {
        userProductMap.set(rv.userId, {
          userId: rv.userId,
          productId: rv.productId as string,
          createdAt: rv.createdAt,
        });
      }
    }

    const results: Array<{
      phone: string;
      name: string;
      productName: string;
      productLink: string;
      thumbnailUrl: string;
    }> = [];

    for (const entry of userProductMap.values()) {
      // Check if user already ordered this product
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", entry.userId as any))
        .collect();

      const hasOrdered = orders.some((o) =>
        o.items.some((item) => item.productId === entry.productId),
      );
      if (hasOrdered) continue;

      // Get user's saved address with phone
      const userAddresses = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", entry.userId))
        .collect();
      const addr = userAddresses.find((a) => a.isDefault) || userAddresses[0];
      if (!addr?.phone) continue;

      const waPhone = addr.phone.startsWith("+")
        ? addr.phone
        : `+91${addr.phone.replace(/^0+/, "")}`;
      if (waPhone.length < 12) continue;

      // Get user name
      let user: any = null;
      try {
        user = await ctx.db.get(entry.userId as any);
      } catch {}
      if (!user) {
        user = await ctx.db
          .query("user")
          .withIndex("userId", (q) => q.eq("userId", entry.userId))
          .first();
      }

      // Get product info
      const product = await ctx.db.get(entry.productId as Id<"products">);
      if (!product?.isActive) continue;

      results.push({
        phone: waPhone,
        name: user?.name || addr.fullName || "there",
        productName: product.name,
        productLink: `${BASE_URL}/product/${product.slug}`,
        thumbnailUrl: product.thumbnail || "",
      });
    }

    return results;
  },
});
