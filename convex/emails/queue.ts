import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { sendBrevoEmail } from "./brevoClient";

export const enqueue = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailsQueue", {
      to: args.to,
      subject: args.subject,
      htmlContent: args.htmlContent,
      sender: args.sender,
      tags: args.tags,
      replyTo: args.replyTo,
      templateId: args.templateId,
      params: args.params,
      status: "pending",
      retries: 0,
      createdAt: Date.now(),
    });
  },
});

export const getPending = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailsQueue")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .take(args.limit);
  },
});

export const updateStatus = internalMutation({
  args: {
    id: v.id("emailsQueue"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    if (!email) throw new Error("Email not found in queue");

    const patch: any = {
      status: args.status,
      errorMessage: args.errorMessage,
      processedAt: Date.now(),
    };

    if (args.status === "pending") {
      patch.retries = email.retries + 1;
      // If retries exceed 3, mark as failed permanently
      if (patch.retries >= 3) {
        patch.status = "failed";
      }
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const processQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    // Take a batch of 10 pending emails to prevent timeouts and run cleanly
    const pending = await ctx.runQuery(internal.emails.queue.getPending, {
      limit: 10,
    });

    for (const email of pending) {
      try {
        // Parse stringified params if they exist
        const paramsObj = email.params ? JSON.parse(email.params) : undefined;

        await sendBrevoEmail({
          to: email.to,
          subject: email.subject,
          htmlContent: email.htmlContent,
          sender: email.sender,
          tags: email.tags,
          replyTo: email.replyTo,
          templateId: email.templateId,
          params: paramsObj,
        });

        // Mark as sent
        await ctx.runMutation(internal.emails.queue.updateStatus, {
          id: email._id,
          status: "sent",
        });
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[EmailQueue] Failed to send email ${email._id}:`,
          errorMsg,
        );

        // Put back in pending (to increment retry count) or fail
        await ctx.runMutation(internal.emails.queue.updateStatus, {
          id: email._id,
          status: "pending",
          errorMessage: errorMsg,
        });
      }
    }
  },
});
