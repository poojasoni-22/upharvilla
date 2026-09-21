import { internal } from "../_generated/api";
import { internalAction, internalQuery } from "../_generated/server";
import { env } from "../env";
import {
  B,
  ctaButton,
  emailFooter,
  emailHeader,
  emailWrapper,
  infoRow,
  productGrid,
} from "./emailLayout";

const BASE_URL = env.SITE_URL;

export const _getOrdersPendingReminder = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;

    const pending = await ctx.db
      .query("orders")
      .withIndex("by_status_created", (q) =>
        q
          .eq("orderStatus", "placed")
          .gt("createdAt", twoDaysAgo)
          .lt("createdAt", oneDayAgo),
      )
      .collect();

    const results = [];
    for (const order of pending) {
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
          createdAt: order.createdAt,
          items: order.items.map((i) => ({
            name: i.name,
            thumbnail: i.thumbnail || "",
          })),
        });
    }
    return results;
  },
});

export const sendOrderReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.runQuery(
      internal.emails.reminderEmail._getOrdersPendingReminder,
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

      const steps = [
        { icon: "✅", label: "Order Placed", done: true },
        { icon: "📦", label: "Being Packed", done: true },
        { icon: "🚚", label: "Out for Delivery", done: false },
        { icon: "🎁", label: "Delivered", done: false },
      ];

      const stepRow = steps
        .map(
          (s) => `
          <td style="text-align:center;padding:0 6px;width:25%;">
            <div style="font-size:20px;margin-bottom:6px;">${s.icon}</div>
            <div style="width:100%;height:3px;background:${s.done ? B.primary : B.border};border-radius:4px;margin-bottom:6px;"></div>
            <p style="margin:0;font-size:11px;font-weight:${s.done ? "600" : "400"};color:${s.done ? B.primary : B.textLight};font-family:Poppins,Arial,sans-serif;">${s.label}</p>
          </td>`,
        )
        .join("");

      const body = `
        ${emailHeader("Your order is being prepared 📦")}
        <tr><td style="padding:28px 24px 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
            Great news, ${firstName}!
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:${B.textMid};line-height:1.7;font-family:Poppins,Arial,sans-serif;">
            Your order <strong style="color:${B.primary};">#${shortId}</strong> is being carefully packed by our team.
          </p>

          <!-- Progress tracker -->
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
            <tr>${stepRow}</tr>
          </table>

          <!-- Product thumbnails -->
          ${itemGrid}

          <!-- Info -->
          <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4fe;border-radius:10px;margin-bottom:20px;">
            <tr><td style="padding:14px 18px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                ${infoRow("Order ID", `#${shortId}`)}
                ${infoRow("Expected Dispatch", "1–2 business days")}
              </table>
            </td></tr>
          </table>

          ${ctaButton("View My Order →", `${BASE_URL}/my-orders`)}
        </td></tr>

        <tr><td style="height:32px;"></td></tr>
        ${emailFooter()}
      `;

      const templateIdStr = process.env.BREVO_TEMPLATE_ORDER_REMINDER;
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
          }),
          tags: ["order-reminder"],
        });
      } else {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: order.email, name: order.name }],
          subject: `📦 Your order #${shortId} is being packed — upharVilla`,
          htmlContent: emailWrapper(body),
          sender: { email: "orders@upharvilla.in", name: "upharVilla Orders" },
          tags: ["order-reminder"],
        });
      }
    }

    await ctx.runAction(internal.emails.queue.processQueue);
    console.log(`[Reminder] Enqueued ${orders.length} order reminder emails`);
  },
});
