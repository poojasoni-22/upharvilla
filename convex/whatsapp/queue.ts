import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { sendWhatsAppMessage } from "./whatsappClient";

// ── Enqueue a WhatsApp message ───────────────────────────────────────────────
export const enqueue = internalMutation({
  args: {
    to: v.string(), // E.164 phone
    templateName: v.string(), // Meta-approved template name
    languageCode: v.string(), // "en" or "hi"
    components: v.optional(v.string()), // Stringified JSON template variables
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("whatsappQueue", {
      to: args.to,
      templateName: args.templateName,
      languageCode: args.languageCode,
      components: args.components,
      status: "pending",
      retries: 0,
      createdAt: Date.now(),
    });
  },
});

// ── Fetch pending WhatsApp messages ──────────────────────────────────────────
export const getPending = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whatsappQueue")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .take(args.limit);
  },
});

// ── Update message status with retry logic ───────────────────────────────────
export const updateStatus = internalMutation({
  args: {
    id: v.id("whatsappQueue"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.id);
    if (!msg) throw new Error("WhatsApp message not found in queue");

    const patch: any = {
      status: args.status,
      errorMessage: args.errorMessage,
      processedAt: Date.now(),
    };

    if (args.status === "pending") {
      patch.retries = msg.retries + 1;
      // If retries exceed 3, mark as failed permanently
      if (patch.retries >= 3) {
        patch.status = "failed";
      }
    }

    await ctx.db.patch(args.id, patch);
  },
});

// ── Cron-triggered queue processor ───────────────────────────────────────────
export const processQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    // Take a batch of 10 pending messages to prevent timeouts
    const pending = await ctx.runQuery(internal.whatsapp.queue.getPending, {
      limit: 10,
    });

    for (const msg of pending) {
      try {
        // Parse stringified components if they exist
        const components = msg.components
          ? JSON.parse(msg.components)
          : undefined;

        await sendWhatsAppMessage({
          to: msg.to,
          templateName: msg.templateName,
          languageCode: msg.languageCode,
          components,
        });

        // Mark as sent
        await ctx.runMutation(internal.whatsapp.queue.updateStatus, {
          id: msg._id,
          status: "sent",
        });
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[WhatsAppQueue] Failed to send message ${msg._id}:`,
          errorMsg,
        );

        // Put back in pending (to increment retry count) or fail
        await ctx.runMutation(internal.whatsapp.queue.updateStatus, {
          id: msg._id,
          status: "pending",
          errorMessage: errorMsg,
        });
      }
    }
  },
});
