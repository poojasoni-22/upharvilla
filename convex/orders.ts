import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getTableCount } from "./counterUtils";

export const count = query({
  args: {},
  handler: async (ctx) => {
    return await getTableCount(ctx, "orders");
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Cap at 200 most recent orders — prevents runaway reads at scale
    const orders = await ctx.db.query("orders").order("desc").take(200);

    // Batch-fetch unique product IDs in one pass
    const productIdSet = new Set<Id<"products">>();
    for (const order of orders) {
      for (const item of order.items) {
        productIdSet.add(item.productId);
      }
    }

    const productMap = new Map<string, any>();
    for (const pid of productIdSet) {
      const product = await ctx.db.get(pid);
      if (product) productMap.set(pid, product);
    }

    // Batch-fetch unique user IDs in one pass
    const userIdSet = new Set<string>();
    for (const order of orders) {
      userIdSet.add(order.userId);
    }

    const userMap = new Map<string, { name: string; email: string }>();
    for (const uid of userIdSet) {
      let user: any = null;
      try {
        user = await ctx.db.get(uid as Id<"user">);
      } catch {}
      if (!user) {
        user = await ctx.db
          .query("user")
          .withIndex("userId", (q) => q.eq("userId", uid))
          .first();
      }
      if (user) userMap.set(uid, { name: user.name, email: user.email });
    }

    // Populate orders with cached lookups — no per-order queries
    return await Promise.all(
      orders.map(async (order) => {
        const address = await ctx.db.get(order.addressId);

        const enrichedItems = order.items.map((item) => {
          const product = productMap.get(item.productId);
          return {
            ...item,
            category: product?.category,
            subCategory: product?.subCategory,
            tags: product?.tags,
            productThumbnail: product?.thumbnail || item.thumbnail,
          };
        });

        return {
          ...order,
          items: enrichedItems,
          user: userMap.get(order.userId) ?? {
            name: "Unknown User",
            email: "N/A",
          },
          address,
        };
      }),
    );
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("placed"),
      v.literal("shipped"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const patch: any = { orderStatus: args.status };
    if (args.status === "shipped") {
      patch.shippedAt = Date.now();
    } else if (args.status === "out_for_delivery") {
      patch.outForDeliveryAt = Date.now();
      if (!order.shippedAt) {
        patch.shippedAt = Date.now() - 1 * 24 * 60 * 60 * 1000;
      }
    } else if (args.status === "delivered") {
      patch.deliveredAt = Date.now();
      if (!order.outForDeliveryAt) {
        patch.outForDeliveryAt = Date.now() - 12 * 60 * 60 * 1000;
      }
      if (!order.shippedAt) {
        patch.shippedAt = Date.now() - 1 * 24 * 60 * 60 * 1000;
      }
    } else if (args.status === "placed") {
      patch.shippedAt = undefined;
      patch.outForDeliveryAt = undefined;
      patch.deliveredAt = undefined;
    }

    await ctx.db.patch(args.orderId, patch);

    let user: any = null;
    try {
      user = await ctx.db.get(order.userId as Id<"user">);
    } catch {}
    if (!user) {
      user = await ctx.db
        .query("user")
        .withIndex("userId", (q) => q.eq("userId", order.userId))
        .first();
    }
    if (
      user?.email &&
      (args.status === "shipped" ||
        args.status === "out_for_delivery" ||
        args.status === "delivered")
    ) {
      await ctx.scheduler.runAfter(
        0,
        internal.emails.orderEmail.sendOrderStatusEmail,
        {
          customerEmail: user.email,
          customerName: user.name || "Customer",
          orderId: args.orderId,
          status: args.status,
          items: order.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            thumbnail: item.thumbnail,
          })),
        },
      );
    }

    // Also send WhatsApp notification using the delivery address phone
    const address = await ctx.db.get(order.addressId);
    if (
      address?.phone &&
      (args.status === "shipped" ||
        args.status === "out_for_delivery" ||
        args.status === "delivered")
    ) {
      const waPhone = address.phone.startsWith("+")
        ? address.phone
        : `+91${address.phone.replace(/^0+/, "")}`;

      if (waPhone.length >= 12) {
        const firstThumbnail = order.items[0]?.thumbnail || "";

        await ctx.scheduler.runAfter(
          0,
          internal.whatsapp.orderNotifications.sendOrderStatusWhatsApp,
          {
            phone: waPhone,
            customerName: address.fullName || user?.name || "Customer",
            orderId: args.orderId,
            status: args.status,
            thumbnailUrl: firstThumbnail,
          },
        );
      }
    }

    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
    const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

    // ══════════════════════════════════════════════════
    // SHARED DATA FETCHES (each table scanned ONCE)
    // ══════════════════════════════════════════════════

    // 1 scan: all paid orders (reused by 8+ metrics)
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status_created", (q) =>
        q.eq("paymentStatus", "paid"),
      )
      .collect();

    // Derived subsets — no extra DB reads, just in-memory filters
    const paidOrders30d = paidOrders.filter(
      (o) => o.createdAt >= thirtyDaysAgo,
    );
    const paidOrders7d = paidOrders.filter((o) => o.createdAt >= sevenDaysAgo);
    const paidOrders6m = paidOrders.filter((o) => o.createdAt >= sixMonthsAgo);

    // 1 read each: counter table (not full scans)
    const totalOrdersCount = await getTableCount(ctx, "orders");
    const totalEnquiriesCount = await getTableCount(ctx, "enquiries");

    // 1 scan: low stock products
    const lowStockProducts = await ctx.db
      .query("products")
      .withIndex("by_active_stock", (q) =>
        q.eq("isActive", true).lte("stock", 5),
      )
      .collect();
    const lowStockCount = lowStockProducts.length;

    // 1 scan: active products (reused for inventory + category revenue)
    const activeProducts = await ctx.db
      .query("products")
      .withIndex("by_active_launched_at", (q) => q.eq("isActive", true))
      .collect();

    // Build product category lookup map (avoids per-item DB reads)
    const productCategoryMap = new Map<string, string>();
    for (const p of activeProducts) {
      productCategoryMap.set(p._id, p.category);
    }

    // ══════════════════════════════════════════════════
    // BASIC STATS (original getStats metrics)
    // ══════════════════════════════════════════════════

    // Total revenue
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Last 7 days sales
    const last7DaysSales: { date: string; amount: number; count: number }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayOrders = paidOrders7d.filter(
        (o) => o.createdAt >= dayStart && o.createdAt < dayEnd,
      );
      last7DaysSales.push({
        date: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        amount: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        count: dayOrders.length,
      });
    }

    // Order status breakdown (from paid orders only)
    const statusCounts: Record<string, { count: number; revenue: number }> = {};
    for (const order of paidOrders) {
      const s = order.orderStatus;
      if (!statusCounts[s]) statusCounts[s] = { count: 0, revenue: 0 };
      statusCounts[s].count++;
      statusCounts[s].revenue += order.totalAmount;
    }
    const orderStatuses = [
      "placed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ] as const;
    const orderStatusBreakdown = orderStatuses.map((status) => ({
      status,
      count: statusCounts[status]?.count ?? 0,
      revenue: statusCounts[status]?.revenue ?? 0,
    }));

    // Inventory by category
    const categories = [
      "customized-gifts",
      "corporate-gifts",
      "hampers",
      "frames-bouquet",
      "shop-by-occasion",
      "new-arrivals",
    ] as const;
    const inventoryByCategory = categories
      .map((category) => {
        const products = activeProducts.filter(
          (product) => product.category === category,
        );
        return {
          category,
          totalProducts: products.length,
          healthy: products.filter((product) => product.stock > 5).length,
          lowStock: products.filter(
            (product) => product.stock > 0 && product.stock <= 5,
          ).length,
          outOfStock: products.filter((product) => product.stock <= 0).length,
          stockUnits: products.reduce((sum, product) => sum + product.stock, 0),
        };
      })
      .filter((category) => category.totalProducts > 0);

    // Top products
    const topProductMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const current = topProductMap.get(item.name) ?? {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        topProductMap.set(item.name, current);
      }
    }
    const topProducts = Array.from(topProductMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ══════════════════════════════════════════════════
    // ADVANCED STATS (all computed from already-fetched data)
    // ══════════════════════════════════════════════════

    // Monthly Revenue (last 6 months)
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      monthlyMap.set(key, { revenue: 0, orders: 0 });
    }
    for (const order of paidOrders6m) {
      const d = new Date(order.createdAt);
      const key = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!;
        entry.revenue += order.totalAmount;
        entry.orders += 1;
      }
    }
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }),
    );

    // Revenue by Category — uses in-memory productCategoryMap, no per-item DB reads
    const categoryRevenueMap = new Map<string, number>();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const cat = productCategoryMap.get(item.productId) ?? "unknown";
        categoryRevenueMap.set(
          cat,
          (categoryRevenueMap.get(cat) ?? 0) + item.price * item.quantity,
        );
      }
    }
    const totalCatRevenue = Array.from(categoryRevenueMap.values()).reduce(
      (s, v) => s + v,
      0,
    );
    const revenueByCategory = Array.from(categoryRevenueMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage:
          totalCatRevenue > 0
            ? Math.round((revenue / totalCatRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily Order Volume (last 30 days) — reuses paidOrders30d
    const dailyOrderVolume: {
      date: string;
      count: number;
      revenue: number;
    }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayOrders = paidOrders30d.filter(
        (o) => o.createdAt >= dayStart && o.createdAt < dayEnd,
      );
      dailyOrderVolume.push({
        date: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      });
    }

    // AOV Weekly (last 30 days, 4 weekly buckets)
    const aovWeekly: { week: string; aov: number; orders: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
      const weekOrders = paidOrders30d.filter(
        (o) => o.createdAt >= weekStart && o.createdAt < weekEnd,
      );
      const totalRev = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      aovWeekly.push({
        week: `Week ${4 - i}`,
        aov:
          weekOrders.length > 0 ? Math.round(totalRev / weekOrders.length) : 0,
        orders: weekOrders.length,
      });
    }

    // Overall AOV
    const overallAOV =
      paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Coupon Performance — 1 scan of couponUsages + up to 5 point reads
    const couponUsages = await ctx.db.query("couponUsages").collect();
    const couponPerfMap = new Map<
      string,
      { couponId: string; redemptions: number; totalDiscount: number }
    >();
    for (const usage of couponUsages) {
      const key = usage.couponId;
      const entry = couponPerfMap.get(key) ?? {
        couponId: key,
        redemptions: 0,
        totalDiscount: 0,
      };
      entry.redemptions += 1;
      entry.totalDiscount += usage.discountAmount;
      couponPerfMap.set(key, entry);
    }
    const couponPerformanceRaw = Array.from(couponPerfMap.values())
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);
    const couponPerformance = await Promise.all(
      couponPerformanceRaw.map(async (entry) => {
        const coupon = await ctx.db.get(entry.couponId as Id<"coupons">);
        return {
          code: (coupon as any)?.code ?? "UNKNOWN",
          redemptions: entry.redemptions,
          totalDiscount: entry.totalDiscount,
        };
      }),
    );

    // Review Ratings Distribution — 1 scan
    const reviews = await ctx.db.query("reviews").collect();
    const ratingDistribution: { rating: number; count: number }[] = [];
    for (let r = 5; r >= 1; r--) {
      ratingDistribution.push({
        rating: r,
        count: reviews.filter((rev) => rev.rating === r).length,
      });
    }

    // Hourly Order Heatmap — computed from paidOrders30d (already fetched)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const heatmapMap = new Map<string, number>();
    for (const order of paidOrders30d) {
      const d = new Date(order.createdAt);
      const key = `${dayNames[d.getDay()]}-${d.getHours()}`;
      heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + 1);
    }
    const heatmapData: {
      hour: number;
      dayOfWeek: string;
      count: number;
    }[] = [];
    for (const day of dayNames) {
      for (let h = 0; h < 24; h++) {
        heatmapData.push({
          dayOfWeek: day,
          hour: h,
          count: heatmapMap.get(`${day}-${h}`) ?? 0,
        });
      }
    }

    // Payment Status Breakdown — computed from paidOrders + counter delta
    // Paid count is known from paidOrders.length.
    // Pending + failed = totalOrdersCount - paidOrders.length (approximation
    // without another full scan). For exact breakdown we do a lightweight
    // computation from already-available data.
    const paidCount = paidOrders.length;
    const nonPaidCount = totalOrdersCount - paidCount;
    const paymentStatusBreakdown = [
      { status: "paid", count: paidCount },
      { status: "pending", count: Math.max(0, nonPaidCount) },
    ];

    // Recent Activity Feed — 3 tiny reads (5 each, uses indexes)
    const recentOrders = await ctx.db.query("orders").order("desc").take(5);
    const recentEnquiries = await ctx.db
      .query("enquiries")
      .withIndex("by_created_at")
      .order("desc")
      .take(5);
    const recentReviews = await ctx.db.query("reviews").order("desc").take(5);

    type ActivityItem = {
      type: string;
      description: string;
      time: number;
    };
    const activities: ActivityItem[] = [];
    for (const o of recentOrders) {
      activities.push({
        type: "order",
        description: `New order — ₹${o.totalAmount.toLocaleString("en-IN")} (${o.items.length} item${o.items.length > 1 ? "s" : ""})`,
        time: o.createdAt,
      });
    }
    for (const e of recentEnquiries) {
      activities.push({
        type: "enquiry",
        description: `Enquiry from ${e.name} — "${e.message.slice(0, 50)}${e.message.length > 50 ? "…" : ""}"`,
        time: e.createdAt,
      });
    }
    for (const r of recentReviews) {
      activities.push({
        type: "review",
        description: `${r.userName} rated ${r.rating}★ — "${r.reviewText.slice(0, 40)}${r.reviewText.length > 40 ? "…" : ""}"`,
        time: r.createdAt,
      });
    }
    activities.sort((a, b) => b.time - a.time);
    const recentActivity = activities.slice(0, 10);

    // Revenue Growth (current 30d vs previous 30d)
    const current30dRevenue = paidOrders30d.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const prev30dOrders = paidOrders.filter(
      (o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo,
    );
    const previous30dRevenue = prev30dOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const revenueGrowthPercent =
      previous30dRevenue > 0
        ? Math.round(
            ((current30dRevenue - previous30dRevenue) / previous30dRevenue) *
              100,
          )
        : current30dRevenue > 0
          ? 100
          : 0;

    // ══════════════════════════════════════════════════
    // RETURN EVERYTHING IN ONE RESPONSE
    // ══════════════════════════════════════════════════

    return {
      // Basic stats
      totalRevenue,
      totalOrdersCount,
      totalEnquiriesCount,
      lowStockCount,
      last7DaysSales,
      orderStatusBreakdown,
      inventoryByCategory,
      topProducts,
      // Advanced stats
      monthlyRevenue,
      revenueByCategory,
      dailyOrderVolume,
      aovWeekly,
      overallAOV,
      couponPerformance,
      ratingDistribution,
      totalReviews: reviews.length,
      heatmapData,
      paymentStatusBreakdown,
      recentActivity,
      revenueGrowth: {
        current: current30dRevenue,
        previous: previous30dRevenue,
        growthPercent: revenueGrowthPercent,
      },
    };
  },
});

export const listUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const validUserIds = new Set<string>([identity.subject]);
    if (identity.email) {
      const dbUser = await ctx.db
        .query("user")
        .withIndex("email_name", (q) => q.eq("email", identity.email!))
        .first();
      if (dbUser) {
        validUserIds.add(dbUser._id);
        if (dbUser.userId) validUserIds.add(dbUser.userId);
      }
    }

    const allOrders = [];
    for (const uid of validUserIds) {
      const userOrders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", uid))
        .order("desc")
        .collect();
      allOrders.push(...userOrders);
    }

    // Deduplicate by order ID and sort descending
    const orderMap = new Map<string, any>();
    for (const ord of allOrders) {
      orderMap.set(ord._id, ord);
    }
    const orders = Array.from(orderMap.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    return await Promise.all(
      orders.map(async (order) => {
        const address = await ctx.db.get(order.addressId);
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        return {
          ...order,
          address,
          reviews,
        };
      }),
    );
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to view your order details");
    }

    const validUserIds = new Set<string>([identity.subject]);
    if (identity.email) {
      const dbUser = await ctx.db
        .query("user")
        .withIndex("email_name", (q) => q.eq("email", identity.email!))
        .first();
      if (dbUser) {
        validUserIds.add(dbUser._id);
        if (dbUser.userId) validUserIds.add(dbUser.userId);
      }
    }
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    if (!validUserIds.has(order.userId)) {
      throw new Error("You do not have permission to view this order");
    }

    const address = await ctx.db.get(order.addressId);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();
    return {
      ...order,
      address,
      reviews,
    };
  },
});

// ═══════════════════════════════════════════════════
// ADMIN: Customer Management
// ═══════════════════════════════════════════════════

// Paginated customer list for admin UI — 25 per page
// Order aggregation computed from paid orders index (not full scan)
export const listCustomersPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("user")
      .order("desc")
      .paginate(args.paginationOpts);

    // Build order map from paid orders only (indexed query)
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status_created", (q) =>
        q.eq("paymentStatus", "paid"),
      )
      .collect();

    const userOrderMap = new Map<
      string,
      { orderCount: number; totalSpend: number; lastOrderAt: number }
    >();
    for (const order of paidOrders) {
      const existing = userOrderMap.get(order.userId) ?? {
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: 0,
      };
      existing.orderCount += 1;
      existing.totalSpend += order.totalAmount;
      if (order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt;
      }
      userOrderMap.set(order.userId, existing);
    }

    const enrichedPage = result.page.map((user) => {
      const orderData = userOrderMap.get(user._id) ?? {
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: 0,
      };
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        createdAt: user.createdAt,
        orderCount: orderData.orderCount,
        totalSpend: orderData.totalSpend,
        lastOrderAt: orderData.lastOrderAt,
      };
    });

    return {
      ...result,
      page: enrichedPage,
    };
  },
});

// Legacy: capped version for any non-paginated consumers
export const listCustomers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").order("desc").take(500);
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status_created", (q) =>
        q.eq("paymentStatus", "paid"),
      )
      .collect();

    const userOrderMap = new Map<
      string,
      { orderCount: number; totalSpend: number; lastOrderAt: number }
    >();
    for (const order of paidOrders) {
      const existing = userOrderMap.get(order.userId) ?? {
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: 0,
      };
      existing.orderCount += 1;
      existing.totalSpend += order.totalAmount;
      if (order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt;
      }
      userOrderMap.set(order.userId, existing);
    }

    return users.map((user) => {
      const orderData = userOrderMap.get(user._id) ?? {
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: 0,
      };
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        createdAt: user.createdAt,
        orderCount: orderData.orderCount,
        totalSpend: orderData.totalSpend,
        lastOrderAt: orderData.lastOrderAt,
      };
    });
  },
});
