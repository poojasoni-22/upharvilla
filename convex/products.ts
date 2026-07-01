import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  decrementCounter,
  getTableCount,
  incrementCounter,
} from "./counterUtils";

// Shared category validator — single source of truth
const CATEGORY_VALIDATOR = v.union(
  v.literal("customized-gifts"),
  v.literal("corporate-gifts"),
  v.literal("hampers"),
  v.literal("frames-bouquet"),
  v.literal("shop-by-occasion"),
  v.literal("new-arrivals"),
);

const ALL_CATEGORIES = [
  "customized-gifts",
  "corporate-gifts",
  "hampers",
  "frames-bouquet",
  "shop-by-occasion",
  "new-arrivals",
] as const;

/** Shared relevance scoring — DRY helper used by search() and getFilteredProducts(). */
function scoreProductRelevance(
  product: {
    name: string;
    tags: string[];
    subCategory?: string;
    category: string;
    description: string;
  },
  term: string,
): number {
  let score = 0;
  const nameLower = product.name.toLowerCase();

  if (nameLower === term) score += 100;
  else if (nameLower.startsWith(term)) score += 80;
  else if (new RegExp(`\\b${term}\\b`, "i").test(nameLower)) score += 60;
  else if (nameLower.includes(term)) score += 40;

  if (product.tags.some((t) => t.toLowerCase() === term)) score += 30;
  else if (product.tags.some((t) => t.toLowerCase().includes(term)))
    score += 15;

  if (product.subCategory?.toLowerCase().includes(term)) score += 10;
  if (product.category.toLowerCase().includes(term)) score += 5;
  if (product.description.toLowerCase().includes(term)) score += 1;

  return score;
}

/** Fetch active products matching category search term, parallelized. */
async function fetchMatchingCategoryProducts(ctx: any, term: string) {
  const matchedCategories = ALL_CATEGORIES.filter(
    (cat) => cat.includes(term) || cat.replace("-", " ").includes(term),
  );
  if (matchedCategories.length === 0) return [];

  const results = await Promise.all(
    matchedCategories.map((cat) =>
      ctx.db
        .query("products")
        .withIndex("by_category_active", (q: any) =>
          q.eq("category", cat).eq("isActive", true),
        )
        .take(50),
    ),
  );
  return results.flat();
}

// ──────────────────────────────────────────────
// QUERIES
// ──────────────────────────────────────────────

/**
 * Lightweight list for admin inventory table — returns only display fields.
 * Full product data should use getById when editing.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").order("desc").collect();
    return products.map(
      ({
        _id,
        _creationTime,
        name,
        slug,
        description,
        price,
        stock,
        category,
        subCategory,
        thumbnail,
        isActive,
        markNewArrival,
        markTrending,
        markMostPurchased,
        markMostSold,
        discount,
        launchedAt,
        tags,
      }) => ({
        _id,
        _creationTime,
        name,
        slug,
        description,
        price,
        stock,
        category,
        subCategory,
        thumbnail,
        isActive,
        markNewArrival,
        markTrending,
        markMostPurchased,
        markMostSold,
        discount,
        launchedAt,
        tags,
      }),
    );
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return await getTableCount(ctx, "products");
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Paginated product list — always 10 per page.
 * Use `usePaginatedQuery` on the frontend with `initialNumItems: 10`.
 */
export const getPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Full-text search by product name.
 * Returns up to 10 results — search results are never paginated to keep UX fast.
 */
export const search = query({
  args: {
    searchTerm: v.string(),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const term = args.searchTerm.toLowerCase().trim();
    if (!term) return [];

    // 1. Search by name using Search Index (up to 30 results)
    const nameMatches = await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) => q.search("name", term))
      .take(30);

    const products = args.includeInactive
      ? nameMatches
      : nameMatches.filter((p) => p.isActive);

    // 2. Fetch matching category products (parallelized)
    const categoryProducts = await fetchMatchingCategoryProducts(ctx, term);
    const productIds = new Set(products.map((p) => p._id));
    for (const p of categoryProducts) {
      if (!productIds.has(p._id)) {
        products.push(p);
        productIds.add(p._id);
      }
    }

    // 3. Score and sort using shared helper
    const scored = products
      .map((p) => ({ product: p, score: scoreProductRelevance(p, term) }))
      .sort((a, b) => b.score - a.score);

    return scored.map((s) => s.product).slice(0, 10);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getByCategory = query({
  args: {
    category: CATEGORY_VALIDATOR,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category_active", (q) =>
        q.eq("category", args.category).eq("isActive", true),
      )
      .take(100);
  },
});

/**
 * Filter products by one or more tags (AND logic).
 * Streams and stops early at 50 results.
 */
export const getByTags = query({
  args: { tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.tags.length === 0) return [];

    const results = [];
    for await (const p of ctx.db
      .query("products")
      .withIndex("by_active_launched_at", (q) => q.eq("isActive", true))
      .order("desc")) {
      if (args.tags.every((tag) => p.tags.includes(tag))) {
        results.push(p);
        if (results.length >= 50) break;
      }
    }
    return results;
  },
});

/**
 * Filter products with sorting, price range, and tag filtering.
 * All filter parameters are optional.
 */
export const getFilteredProducts = query({
  args: {
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    flag: v.optional(
      v.union(
        v.literal("new-arrival"),
        v.literal("trending"),
        v.literal("most-sold"),
        v.literal("most-purchased"),
      ),
    ),
    sortBy: v.optional(
      v.union(
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("newest"),
        v.literal("name"),
        v.literal("relevance"),
      ),
    ),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products;
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase().trim();
      const nameMatches = await ctx.db
        .query("products")
        .withSearchIndex("search_name", (q) => q.search("name", term))
        .take(50);
      products = nameMatches.filter((p) => p.isActive);

      // Fetch matching category products (parallelized)
      const categoryProducts = await fetchMatchingCategoryProducts(ctx, term);
      const productIds = new Set(products.map((p) => p._id));
      for (const p of categoryProducts) {
        if (!productIds.has(p._id)) {
          products.push(p);
          productIds.add(p._id);
        }
      }
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_active_launched_at", (q) => q.eq("isActive", true))
        .order("desc")
        .take(200);
    }

    // Filter by search term in memory if it was search-indexed, but now we split by keywords
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase().trim();
      const keywords = term.split(/\s+/).filter(Boolean);
      products = products.filter((p) => {
        const textToSearch =
          `${p.name} ${p.description} ${p.category} ${p.subCategory || ""} ${p.tags.join(" ")}`.toLowerCase();
        return keywords.every((keyword) => textToSearch.includes(keyword));
      });
    }

    // Filter by category (e.g. "customized-gifts", "corporate-gifts")
    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }

    // Filter by special boolean flags (new-arrival, trending, etc.)
    if (args.flag) {
      switch (args.flag) {
        case "new-arrival":
          products = products.filter((p) => p.markNewArrival === true);
          break;
        case "trending":
          products = products.filter((p) => p.markTrending === true);
          break;
        case "most-sold":
          products = products.filter((p) => p.markMostSold === true);
          break;
        case "most-purchased":
          products = products.filter((p) => p.markMostPurchased === true);
          break;
      }
    }

    // Filter by tags (AND logic)
    if (args.tags && args.tags.length > 0) {
      products = products.filter((p) =>
        args.tags?.every((tag) => p.tags.includes(tag)),
      );
    }

    // Filter by price range
    if (args.minPrice !== undefined) {
      products = products.filter((p) => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= args.maxPrice!);
    }

    // Sort
    const sortBy = args.sortBy || "newest";
    switch (sortBy) {
      case "price_asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevance": {
        const term = args.searchTerm?.toLowerCase().trim() || "";
        if (!term) {
          products.sort((a, b) => b._creationTime - a._creationTime);
          break;
        }
        const scored = products
          .map((p) => ({ product: p, score: scoreProductRelevance(p, term) }))
          .sort((a, b) => b.score - a.score);
        products = scored.map((s) => s.product);
        break;
      }
      default:
        products.sort((a, b) => b._creationTime - a._creationTime);
        break;
    }

    return products;
  },
});

export const getNewArrivals = query({
  args: { limit: v.optional(v.number()), strict: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // 1. Fetch products explicitly marked as new arrival
    const markedNewArrivals = await ctx.db
      .query("products")
      .withIndex("by_new_arrival_active", (q) =>
        q.eq("markNewArrival", true).eq("isActive", true),
      )
      .take(50);

    // In strict mode (used by /new-arrivals page), only return explicitly marked products
    if (args.strict) {
      markedNewArrivals.sort((a, b) => b.launchedAt - a.launchedAt);
      return args.limit
        ? markedNewArrivals.slice(0, args.limit)
        : markedNewArrivals;
    }

    // 2. Also fetch products launched in last 30 days (for homepage sections)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentArrivals = await ctx.db
      .query("products")
      .withIndex("by_active_launched_at", (q) =>
        q.eq("isActive", true).gte("launchedAt", thirtyDaysAgo),
      )
      .take(50);

    // Combine and deduplicate
    const combined = [...markedNewArrivals, ...recentArrivals];
    const uniqueMap = new Map();
    combined.forEach((p) => uniqueMap.set(p._id, p));

    const results = Array.from(uniqueMap.values());

    // Sort by creation time / launchedAt desc to show latest first
    results.sort((a, b) => b.launchedAt - a.launchedAt);

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

export const getTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_trending_active", (q) =>
        q.eq("markTrending", true).eq("isActive", true),
      )
      .take(50);

    // Sort by creation time desc to show latest trending products first
    products.sort((a, b) => b._creationTime - a._creationTime);

    return args.limit ? products.slice(0, args.limit) : products;
  },
});

export const getMostPurchased = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_most_purchased_active", (q) =>
        q.eq("markMostPurchased", true).eq("isActive", true),
      )
      .take(50);

    // Sort by creation time desc to show latest first
    products.sort((a, b) => b._creationTime - a._creationTime);

    return args.limit ? products.slice(0, args.limit) : products;
  },
});

export const getMostSold = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_most_sold_active", (q) =>
        q.eq("markMostSold", true).eq("isActive", true),
      )
      .take(50);

    // Sort by creation time desc to show latest first
    products.sort((a, b) => b._creationTime - a._creationTime);

    return args.limit ? products.slice(0, args.limit) : products;
  },
});

/**
 * Lightweight query that returns up to 8 active products for carousels
 * using index ranges rather than doing a full database list scan.
 */
export const getRecommendations = query({
  args: { currentProductId: v.id("products") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active_launched_at", (q) => q.eq("isActive", true))
      .order("desc")
      .take(9);
    return products.filter((p) => p._id !== args.currentProductId).slice(0, 8);
  },
});

/**
 * Returns up to `limit` active products that carry a specific occasion tag.
 * Products are matched when their `tags` array includes the given tag string
 * (e.g. "fathers-day", "birthday").
 */
export const getProductsByOccasion = query({
  args: {
    tag: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cap = args.limit ?? 50;
    const tagLower = args.tag.toLowerCase();
    const results = [];

    // Stream through indexed products, stop early once we have enough
    for await (const p of ctx.db
      .query("products")
      .withIndex("by_active_launched_at", (q) => q.eq("isActive", true))
      .order("desc")) {
      if (p.tags.some((t) => t.toLowerCase() === tagLower)) {
        results.push(p);
        if (results.length >= cap) break;
      }
    }

    return results;
  },
});

// ──────────────────────────────────────────────
// MUTATIONS
// ──────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    thumbnail: v.optional(v.string()),
    category: CATEGORY_VALIDATOR,
    subCategory: v.optional(v.string()),
    recipients: v.optional(v.array(v.string())),
    tags: v.array(v.string()),
    stock: v.number(),
    images: v.optional(v.array(v.string())),
    markNewArrival: v.optional(v.boolean()),
    markTrending: v.optional(v.boolean()),
    markMostPurchased: v.optional(v.boolean()),
    markMostSold: v.optional(v.boolean()),
    discount: v.optional(v.number()),
    variants: v.optional(
      v.object({
        sizes: v.optional(v.array(v.string())),
        colors: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a product");
    }

    const userId = identity.subject as Id<"user">;

    // Generate slug: lowercase, spaces → hyphens, strip specials, + 3-char random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    const slug = args.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .concat(`-${randomSuffix}`);

    const productId = await ctx.db.insert("products", {
      name: args.name,
      slug,
      createdByUserId: userId,
      description: args.description,
      price: args.price,
      thumbnail: args.thumbnail,
      images: args.images,
      category: args.category,
      subCategory: args.subCategory,
      recipients: args.recipients,
      tags: args.tags,
      stock: args.stock,
      launchedAt: Date.now(),
      markNewArrival: args.markNewArrival,
      markTrending: args.markTrending,
      markMostPurchased: args.markMostPurchased,
      markMostSold: args.markMostSold,
      discount: args.discount,
      variants: args.variants,
      isActive: true,
    });

    await incrementCounter(ctx, "products");

    return productId;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    await decrementCounter(ctx, "products");
  },
});

export const bulkRemove = mutation({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
      await decrementCounter(ctx, "products");
    }
  },
});

export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isActive: !product.isActive });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    category: v.optional(CATEGORY_VALIDATOR),
    subCategory: v.optional(v.string()),
    recipients: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    markNewArrival: v.optional(v.boolean()),
    markTrending: v.optional(v.boolean()),
    markMostPurchased: v.optional(v.boolean()),
    markMostSold: v.optional(v.boolean()),
    discount: v.optional(v.number()),
    variants: v.optional(
      v.object({
        sizes: v.optional(v.array(v.string())),
        colors: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    // Handle restock notification trigger
    if (fields.stock !== undefined && fields.stock > 0) {
      const oldProduct = await ctx.db.get(id);
      if (oldProduct && oldProduct.stock <= 0) {
        // Restock event detected! Get pending notifications.
        const pendingNotifications = await ctx.db
          .query("stockNotifications")
          .withIndex("by_product_status", (q) =>
            q.eq("productId", id).eq("status", "pending"),
          )
          .collect();

        if (pendingNotifications.length > 0) {
          // Schedule restock emails
          await ctx.scheduler.runAfter(
            0,
            internal.emails.restockEmail.notifyUsersOfRestock,
            {
              productId: id,
              productName: oldProduct.name,
              productSlug: oldProduct.slug,
              thumbnail: oldProduct.thumbnail || "",
              notifications: pendingNotifications.map((n) => ({
                id: n._id,
                email: n.email,
              })),
            },
          );
        }
      }
    }

    await ctx.db.patch(id, fields);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    // If it's already a URL (starts with http), return it as is
    if (args.storageId.startsWith("http")) {
      return args.storageId;
    }
    try {
      return await ctx.storage.getUrl(args.storageId);
    } catch {
      return null;
    }
  },
});

export const requestStockNotification = mutation({
  args: {
    productId: v.id("products"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) {
      throw new Error("Email is required");
    }

    // Optional: get current user id if they are logged in
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity ? (identity.subject as Id<"user">) : undefined;

    // Check if they already requested a notification for this product
    const existing = await ctx.db
      .query("stockNotifications")
      .withIndex("by_email_product", (q) =>
        q.eq("email", email).eq("productId", args.productId),
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      return { success: true, alreadyExists: true };
    }

    await ctx.db.insert("stockNotifications", {
      productId: args.productId,
      email,
      userId,
      createdAt: Date.now(),
      status: "pending",
    });

    return { success: true, alreadyExists: false };
  },
});

export const markNotificationsNotified = internalMutation({
  args: {
    notificationIds: v.array(v.id("stockNotifications")),
  },
  handler: async (ctx, args) => {
    for (const id of args.notificationIds) {
      await ctx.db.patch(id, { status: "notified" });
    }
  },
});

export const recalculateMostSold = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Use indexed query — only fetch paid orders, not ALL orders
    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status_created", (q) =>
        q.eq("paymentStatus", "paid"),
      )
      .collect();

    const salesMap: Record<string, number> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        salesMap[item.productId] =
          (salesMap[item.productId] || 0) + item.quantity;
      }
    }

    const allProducts = await ctx.db.query("products").collect();

    // Find top 8 by sales
    const productSales = allProducts
      .map((p) => ({ id: p._id, salesCount: salesMap[p._id] || 0 }))
      .filter((ps) => ps.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 8);

    const topSoldIds = new Set(productSales.map((ps) => ps.id));

    // Only patch products whose flag needs to change — avoids unnecessary writes
    for (const product of allProducts) {
      const shouldBeMarked = topSoldIds.has(product._id);
      if (product.markMostSold !== shouldBeMarked) {
        await ctx.db.patch(product._id, { markMostSold: shouldBeMarked });
      }
    }
  },
});
