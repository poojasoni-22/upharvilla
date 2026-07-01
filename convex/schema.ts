import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { tables } from "./betterAuth/schema";

export default defineSchema({
  ...tables,
  products: defineTable({
    name: v.string(),
    slug: v.string(), // auto-generated from name, unique for URL
    createdByUserId: v.string(),
    description: v.string(),
    price: v.number(),
    discount: v.optional(v.number()), // e.g. 10 means 10% off

    images: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
    videoUrl: v.optional(v.string()),

    category: v.union(
      v.literal("customized-gifts"),
      v.literal("corporate-gifts"),
      v.literal("hampers"),
      v.literal("frames-bouquet"),
      v.literal("shop-by-occasion"),
      v.literal("new-arrivals"),
    ),
    subCategory: v.optional(v.string()),
    recipients: v.optional(v.array(v.string())),

    tags: v.array(v.string()), // min 2

    launchedAt: v.number(), // Date.now() at time of creation
    markNewArrival: v.optional(v.boolean()), // admin explicit flag
    markTrending: v.optional(v.boolean()), // admin explicit flag
    markMostPurchased: v.optional(v.boolean()), // admin explicit flag
    markMostSold: v.optional(v.boolean()), // admin explicit flag or auto-calculated

    stock: v.number(),

    variants: v.optional(
      v.object({
        sizes: v.optional(v.array(v.string())), // ["S", "M", "XL", "XXL"] or omitted
        colors: v.optional(v.array(v.string())), // ["Red", "Blue"] or omitted
      }),
    ),

    isActive: v.boolean(), // product is active or owner wants to remove it or discontinue.
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active_launched_at", ["isActive", "launchedAt"])
    .index("by_active_stock", ["isActive", "stock"])
    .index("by_category_active", ["category", "isActive"])
    .index("by_trending_active", ["markTrending", "isActive"])
    .index("by_new_arrival_active", ["markNewArrival", "isActive"])
    .index("by_most_purchased_active", ["markMostPurchased", "isActive"])
    .index("by_most_sold_active", ["markMostSold", "isActive"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // -------------------------------
  heroBanners: defineTable({
    imageLink: v.string(),
    altText: v.optional(v.string()),
    visitLink: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // -----------------------------------
  // Wishlist table
  wishlists: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_and_product", ["userId", "productId"]),

  // -----------------------------------
  // Cart table
  carts: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"])
    .index("by_created_at", ["createdAt"]),

  // -----------------------------------
  // Addresses table
  addresses: defineTable({
    userId: v.string(),
    fullName: v.string(),
    phone: v.string(),
    alternatePhone: v.optional(v.string()),
    pincode: v.string(),
    locality: v.string(),
    address: v.string(), // flat/house no, street
    city: v.string(),
    state: v.string(),
    landmark: v.optional(v.string()),
    addressType: v.union(
      v.literal("home"),
      v.literal("work"),
      v.literal("other"),
    ),
    isDefault: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_default", ["userId", "isDefault"]),

  // -----------------------------------
  // Saved For Later table
  savedForLater: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  // -----------------------------------
  // Reservations table
  reservations: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    expiresAt: v.number(), // timestamp
    status: v.union(
      v.literal("reserved"),
      v.literal("completed"),
      v.literal("released"),
    ),
    // Legacy field — kept optional for backward compatibility with existing production documents.
    // New reservations do NOT use this; payment tracking is handled by checkoutSessions table.
    razorpayOrderId: v.optional(v.string()),
  })
    .index("by_user_active", ["userId", "status", "expiresAt"])
    .index("by_product_active", ["productId", "status", "expiresAt"])
    .index("by_expires_at", ["expiresAt"]),

  // -----------------------------------
  // Checkout Sessions — tracks Razorpay orders independently of reservations
  // Replaces the fragile reservation-binding approach for payment verification.
  checkoutSessions: defineTable({
    userId: v.string(),
    razorpayOrderId: v.string(),
    expectedAmountPaise: v.number(), // server-computed total in paise
    status: v.union(
      v.literal("pending"), // order created, awaiting payment
      v.literal("completed"), // payment verified, order placed
    ),
    createdAt: v.number(),
  })
    .index("by_razorpay_order", ["razorpayOrderId"])
    .index("by_user_status", ["userId", "status"]),

  // -----------------------------------
  // Orders table
  orders: defineTable({
    userId: v.string(),
    addressId: v.id("addresses"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        thumbnail: v.optional(v.string()),
      }),
    ),
    totalAmount: v.number(),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
    ),
    orderStatus: v.union(
      v.literal("placed"),
      v.literal("shipped"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    shippedAt: v.optional(v.number()),
    outForDeliveryAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_razorpay_order", ["razorpayOrderId"])
    .index("by_status_created", ["orderStatus", "createdAt"])
    .index("by_payment_status_created", ["paymentStatus", "createdAt"]),

  // -----------------------------------
  // Reviews table
  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    userInitials: v.string(),
    productId: v.id("products"),
    orderId: v.id("orders"),
    itemId: v.string(),
    rating: v.number(),
    reviewText: v.string(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_user_and_item", ["userId", "itemId"])
    .index("by_order", ["orderId"]),

  // -----------------------------------
  // Enquiries table
  enquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  // -----------------------------------
  // Recent Searches table
  recentSearches: defineTable({
    userId: v.string(),
    query: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_query", ["userId", "query"])
    .index("by_user_created", ["userId", "createdAt"]),

  // -----------------------------------
  // Recently Viewed table
  recentlyViewed: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // -----------------------------------
  // Stock Notifications table
  stockNotifications: defineTable({
    productId: v.id("products"),
    email: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("notified")),
  })
    .index("by_product_status", ["productId", "status"])
    .index("by_email_product", ["email", "productId"]),

  // -----------------------------------
  // Counters table
  counters: defineTable({
    table: v.string(), // e.g., "products", "orders"
    count: v.number(),
  }).index("by_table", ["table"]),

  // -----------------------------------
  // Occasion Links table (Shop by Occasion section)
  occasionLinks: defineTable({
    label: v.string(), // e.g. "Father's Day"
    slug: v.string(), // e.g. "fathers-day" — used as product tag filter
    icon: v.string(), // emoji e.g. "👔"
    link: v.optional(v.string()), // optional custom URL override
    sortOrder: v.number(), // controls tab order
    createdAt: v.number(),
  }).index("by_sort_order", ["sortOrder"]),

  // -----------------------------------
  // Navbar Occasion Links
  navbarOccasions: defineTable({
    heading: v.string(), // e.g. "Milestones", "Love & Family", "Festive & Events"
    label: v.string(), // e.g. "Birthday", "Mother's Day"
    link: v.optional(v.string()), // optional override link
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_heading", ["heading"])
    .index("by_sort_order", ["sortOrder"]),

  // -----------------------------------
  // Emails Queue table
  emailsQueue: defineTable({
    to: v.array(
      v.object({
        email: v.string(),
        name: v.optional(v.string()),
      }),
    ),
    subject: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    sender: v.optional(
      v.object({
        email: v.string(),
        name: v.optional(v.string()),
      }),
    ),
    tags: v.optional(v.array(v.string())),
    replyTo: v.optional(
      v.object({
        email: v.string(),
        name: v.optional(v.string()),
      }),
    ),
    templateId: v.optional(v.number()),
    params: v.optional(v.string()), // Stringified JSON
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    retries: v.number(),
    errorMessage: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status_created", ["status", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  // -----------------------------------
  // WhatsApp Message Queue table
  whatsappQueue: defineTable({
    to: v.string(), // E.164 phone: "+919876543210"
    templateName: v.string(), // Meta-approved template name
    languageCode: v.string(), // "en" or "hi"
    components: v.optional(v.string()), // Stringified JSON template variables
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    retries: v.number(),
    errorMessage: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status_created", ["status", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  // -----------------------------------
  // Admin Users — Role-based access control for admin panel
  adminUsers: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("manager")),
    addedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // -----------------------------------
  // User Profiles — WhatsApp opt-in & phone (separate from Better Auth's user table)
  userProfiles: defineTable({
    userId: v.string(), // Better Auth user ID
    whatsappPhone: v.optional(v.string()), // E.164 format: "+919876543210"
    whatsappOptIn: v.optional(v.boolean()), // explicit consent flag
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // -----------------------------------
  // Coupons — Admin-managed discount codes
  coupons: defineTable({
    code: v.string(), // "WELCOME10", "DIWALI50"
    description: v.string(), // "10% off on first order"

    // Discount type
    discountType: v.union(
      v.literal("percentage"), // e.g. 10% off
      v.literal("flat"), // e.g. ₹100 off
      v.literal("free_shipping"), // free delivery
    ),
    discountValue: v.number(), // 10 (for 10%), 100 (for ₹100), 0 (for free_shipping)

    // Constraints
    minOrderAmount: v.optional(v.number()), // minimum cart value (e.g. ₹999)
    maxDiscount: v.optional(v.number()), // cap for percentage discounts (e.g. max ₹500 off)

    // Applicability
    applicableTo: v.union(
      v.literal("all"), // applies to everything
      v.literal("category"), // specific category
      v.literal("product"), // specific product
    ),
    applicableCategory: v.optional(v.string()), // e.g. "customized-gifts"
    applicableProductId: v.optional(v.id("products")),

    // Usage limits
    totalUsageLimit: v.optional(v.number()), // max total redemptions (null = unlimited)
    perUserLimit: v.number(), // max uses per user (default 1)
    currentUsageCount: v.number(), // tracks total redemptions

    // Validity
    startsAt: v.number(), // timestamp
    expiresAt: v.number(), // timestamp

    // Status
    isActive: v.boolean(), // admin can toggle on/off
    createdBy: v.optional(v.string()), // admin userId
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_expires", ["expiresAt"]),

  // -----------------------------------
  // Coupon Usages — Tracks per-user coupon redemptions
  couponUsages: defineTable({
    couponId: v.id("coupons"),
    userId: v.string(),
    orderId: v.optional(v.id("orders")),
    discountAmount: v.number(), // actual discount given
    usedAt: v.number(),
  })
    .index("by_coupon", ["couponId"])
    .index("by_user_coupon", ["userId", "couponId"])
    .index("by_order", ["orderId"]),
});
