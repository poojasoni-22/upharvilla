import { internal } from "../_generated/api";
import { internalAction, internalQuery } from "../_generated/server";
import { env } from "../env";
import {
  B,
  ctaButton,
  emailFooter,
  emailHeader,
  emailWrapper,
  productCard,
} from "./emailLayout";

const BASE_URL = env.SITE_URL;

export const _getOrdersForReview = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;
    const threeDaysAgo = now - 72 * 60 * 60 * 1000;

    const eligible = await ctx.db
      .query("orders")
      .withIndex("by_status_created", (q) =>
        q
          .eq("orderStatus", "delivered")
          .gt("createdAt", threeDaysAgo)
          .lt("createdAt", twoDaysAgo),
      )
      .collect();

    const results = [];
    for (const order of eligible) {
      let user: any = null;
      try {
        user = await ctx.db.get(order.userId as any);
      } catch {}
      if (!user) {
        user = await ctx.db
          .query("user")
          .withIndex("userId", (q) => q.eq("userId", order.userId))
          .first();
      }
      if (user?.email)
        results.push({
          email: user.email,
          name: user.name || "there",
          orderId: order._id,
          items: order.items.map((i, idx) => ({
            name: i.name,
            productId: i.productId as string,
            thumbnail: i.thumbnail || "",
            itemId: `${order._id}-${i.productId}-${idx}`,
          })),
        });
    }
    return results;
  },
});

export const sendReviewRequests = internalAction({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.runQuery(
      internal.emails.reviewEmail._getOrdersForReview,
      {},
    );

    for (const order of orders) {
      const firstName = order.name.split(" ")[0];
      const shortId = order.orderId.slice(-8).toUpperCase();

      // Product cards with "Rate Product" CTA buttons
      const reviewCards = order.items
        .map((item) => {
          const ratingUrl = `${BASE_URL}/my-orders?openReview=${item.itemId}`;
          return productCard({
            name: item.name,
            thumbnail: item.thumbnail,
            link: ratingUrl,
            ctaLabel: "Rate Product",
          });
        })
        .join("");

      const body = `
        ${emailHeader("How was your gift? ⭐")}
        <tr><td style="padding:28px 24px 0;text-align:center;">

          <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
            Enjoying your order, ${firstName}?
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:${B.textMid};line-height:1.7;font-family:Poppins,Arial,sans-serif;max-width:420px;margin-left:auto;margin-right:auto;">
            Your order <strong style="color:${B.primary};">#${shortId}</strong> was delivered a couple of days ago.
            We'd love to know how it went!
          </p>
        </td></tr>

        <tr><td style="padding:0 24px;">
          <!-- Product cards with review buttons -->
          ${reviewCards}

          <!-- Encouragement card -->
          <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#f7f4fe,#fce7f0);border:1px solid ${B.border};border-radius:12px;margin:12px 0 20px;">
            <tr><td style="padding:16px 20px;text-align:center;">
              <p style="margin:0;font-size:13px;color:${B.textMid};font-family:Poppins,Arial,sans-serif;line-height:1.7;">
                Your feedback helps other shoppers discover the perfect gift 💜<br/>
                It only takes <strong>30 seconds!</strong>
              </p>
            </td></tr>
          </table>

          ${ctaButton("Write a Review →", `${BASE_URL}/my-orders`)}
        </td></tr>

        <tr><td style="height:32px;"></td></tr>
        ${emailFooter()}
      `;

      const templateIdStr = process.env.BREVO_TEMPLATE_REVIEW_REQUEST;
      const templateId = templateIdStr
        ? parseInt(templateIdStr, 10)
        : undefined;

      if (templateId && !Number.isNaN(templateId)) {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: order.email, name: order.name }],
          templateId,
          params: JSON.stringify({
            firstName,
            orderId: shortId,
            reviewUrl: `${BASE_URL}/my-orders`,
          }),
          tags: ["review-request"],
        });
      } else {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: order.email, name: order.name }],
          subject: `⭐ How was your upharVilla gift, ${firstName}?`,
          htmlContent: emailWrapper(body),
          sender: { email: "hello@upharvilla.in", name: "upharVilla" },
          tags: ["review-request"],
        });
      }
    }

    await ctx.runAction(internal.emails.queue.processQueue);
    console.log(`[Review] Enqueued ${orders.length} review request emails`);
  },
});
