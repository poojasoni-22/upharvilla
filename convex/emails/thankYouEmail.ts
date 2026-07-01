import { internal } from "../_generated/api";
import { internalAction, internalQuery } from "../_generated/server";
import { env } from "../env";
import {
  B,
  ctaButton,
  emailFooter,
  emailHeader,
  emailWrapper,
  productGrid,
} from "./emailLayout";

const BASE_URL = env.SITE_URL;

export const _getRecentlyDeliveredOrders = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const delivered = await ctx.db
      .query("orders")
      .withIndex("by_status_created", (q) =>
        q.eq("orderStatus", "delivered").gt("createdAt", oneDayAgo),
      )
      .collect();
    const results = [];
    for (const order of delivered) {
      const user = await ctx.db
        .query("user")
        .filter((q) => q.eq(q.field("_id"), order.userId))
        .first();
      if (user?.email)
        results.push({
          email: user.email,
          name: user.name || "there",
          orderId: order._id,
          items: order.items.map((i) => ({
            name: i.name,
            thumbnail: i.thumbnail || "",
          })),
        });
    }
    return results;
  },
});

export const sendThankYouEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.runQuery(
      internal.emails.thankYouEmail._getRecentlyDeliveredOrders,
      {},
    );

    for (const order of orders) {
      const firstName = order.name.split(" ")[0];
      const shortId = order.orderId.slice(-8).toUpperCase();

      // Product thumbnail grid
      const itemGrid = productGrid(
        order.items.map((i) => ({
          name: i.name,
          thumbnail: i.thumbnail,
        })),
      );

      const body = `
        ${emailHeader("Delivery Confirmation")}
        <tr><td style="padding:28px 24px 0;text-align:center;">

          <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
            Thank you, ${firstName}
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:${B.textMid};line-height:1.8;font-family:Poppins,Arial,sans-serif;max-width:420px;margin-left:auto;margin-right:auto;">
            Your order <strong style="color:${B.primary};">#${shortId}</strong> has been successfully delivered. We hope you are pleased with your purchase.
          </p>

          <!-- Delivered card -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;border-collapse:collapse;">
            <tr>
              <td style="background:#faf9ff;border:1px solid ${B.border};border-radius:12px;padding:14px 24px;text-align:center;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#6b21a8;font-family:Poppins,Arial,sans-serif;">Order #${shortId} — Delivered ✓</p>
              </td>
            </tr>
          </table>

          <!-- Product thumbnails -->
          ${itemGrid}

          <p style="margin:0 0 8px;font-size:14px;color:${B.textMid};font-family:Poppins,Arial,sans-serif;">
            Looking for your next special gift? Discover our latest collections.
          </p>

          ${ctaButton("Shop Again", BASE_URL)}
        </td></tr>
        <tr><td style="height:32px;"></td></tr>
        ${emailFooter()}
      `;

      const templateId = env.BREVO_TEMPLATE_THANK_YOU;

      if (templateId) {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: order.email, name: order.name }],
          templateId,
          params: JSON.stringify({
            firstName,
            orderId: shortId,
            shopUrl: BASE_URL,
          }),
          tags: ["thank-you"],
        });
      } else {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: order.email, name: order.name }],
          subject: `Order Delivered: #${shortId}`,
          htmlContent: emailWrapper(body),
          sender: { email: "hello@upharvilla.in", name: "upharVilla" },
          tags: ["thank-you"],
        });
      }
    }

    await ctx.runAction(internal.emails.queue.processQueue);
    console.log(`[ThankYou] Enqueued ${orders.length} thank-you emails`);
  },
});
