import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { incrementCounter } from "./counterUtils";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validation checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!args.name.trim()) throw new Error("Name is required");
    if (!args.email.trim() || !emailRegex.test(args.email)) {
      throw new Error("A valid email address is required");
    }
    if (!args.message.trim()) throw new Error("Message is required");

    // 2. Save enquiry to database
    const enquiryId = await ctx.db.insert("enquiries", {
      name: args.name.trim(),
      email: args.email.trim(),
      phone: args.phone ? args.phone.trim() : undefined,
      message: args.message.trim(),
      createdAt: Date.now(),
    });

    await incrementCounter(ctx, "enquiries");

    // 3. Fire notification emails via Convex Scheduler (fire-and-forget, non-blocking)
    // Send customer auto-reply
    await ctx.scheduler.runAfter(
      0,
      internal.emails.enquiryEmail.sendEnquiryAutoReply,
      {
        name: args.name.trim(),
        email: args.email.trim(),
      },
    );

    // Send admin notification alert
    await ctx.scheduler.runAfter(
      0,
      internal.emails.adminEmail.notifyAdminNewEnquiry,
      {
        name: args.name.trim(),
        email: args.email.trim(),
        phone: args.phone ? args.phone.trim() : undefined,
        message: args.message.trim(),
      },
    );

    return enquiryId;
  },
});

// Paginated list for admin UI — 20 per page
export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiries")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Legacy: capped list for dashboard stats (max 1000 docs)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("enquiries").order("desc").take(1000);
  },
});

export const deleteEnquiry = mutation({
  args: { id: v.id("enquiries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
