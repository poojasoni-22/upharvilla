import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { env } from "../env";
import {
  B,
  ctaButton,
  emailFooter,
  emailHeader,
  emailWrapper,
} from "./emailLayout";

const BASE_URL = env.SITE_URL;

export const notifyUsersOfRestock = internalAction({
  args: {
    productId: v.id("products"),
    productName: v.string(),
    productSlug: v.string(),
    thumbnail: v.string(),
    notifications: v.array(
      v.object({
        id: v.id("stockNotifications"),
        email: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const productUrl = `${BASE_URL}/product/${args.productSlug}`;

    // Send email to all signed-up users in parallel
    const emailPromises = args.notifications.map(async (n) => {
      const body = `
        ${emailHeader("Back in Stock! 🎉")}
        <tr><td style="padding:28px 24px 0;text-align:center;">
          <!-- Celebration Icon -->
          <div style="width:64px;height:64px;background:${B.pinkLight};border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">
            🎁
          </div>

          <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
            It's Back! 🎉
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:${B.textMid};line-height:1.8;font-family:Poppins,Arial,sans-serif;max-width:420px;margin-left:auto;margin-right:auto;">
            Good news! The item you've been waiting for is back in stock. Click the button below to purchase it before it sells out again.
          </p>
        </td></tr>

        <tr><td style="padding:0 24px;">
          <!-- Product card wrapper -->
          <table cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid ${B.border};border-radius:14px;margin-bottom:24px;">
            <tr>
              <td style="padding:16px;text-align:left;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    ${
                      args.thumbnail
                        ? `<td style="width:80px;padding-right:16px;">
                            <img src="${args.thumbnail}" alt="${args.productName}" width="80" height="80" style="object-fit:cover;border-radius:8px;border:1px solid ${B.border};display:block;" />
                           </td>`
                        : ""
                    }
                    <td style="vertical-align:middle;">
                      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;text-transform:capitalize;">
                        ${args.productName}
                      </p>
                      <p style="margin:0;font-size:12px;color:${B.green};font-weight:600;font-family:Poppins,Arial,sans-serif;">
                        Status: Available Now
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${ctaButton("Buy Now →", productUrl)}
        </td></tr>

        <tr><td style="height:32px;"></td></tr>
        ${emailFooter()}
      `;

      try {
        const templateIdStr = process.env.BREVO_TEMPLATE_RESTOCK_NOTIFICATION;
        const templateId = templateIdStr
          ? parseInt(templateIdStr, 10)
          : undefined;

        if (templateId && !Number.isNaN(templateId)) {
          await ctx.runMutation(internal.emails.queue.enqueue, {
            to: [{ email: n.email }],
            replyTo: { email: "support@upharvilla.in", name: "upharVilla" },
            templateId,
            params: JSON.stringify({
              productName: args.productName,
              productSlug: args.productSlug,
              productUrl,
              thumbnail: args.thumbnail,
            }),
            tags: ["product-restocked"],
          });
        } else {
          await ctx.runMutation(internal.emails.queue.enqueue, {
            to: [{ email: n.email }],
            subject: `Back in stock: ${args.productName} is available! — upharVilla`,
            htmlContent: emailWrapper(body),
            sender: { email: "info@upharvilla.in", name: "upharVilla Store" },
            replyTo: { email: "support@upharvilla.in", name: "upharVilla" },
            tags: ["product-restocked"],
          });
        }
      } catch (error) {
        console.error(`Failed to enqueue restock email to ${n.email}:`, error);
      }
    });

    await Promise.all(emailPromises);
    await ctx.runAction(internal.emails.queue.processQueue);

    // Mark notifications as sent in the database
    const notificationIds = args.notifications.map((n) => n.id);
    await ctx.runMutation(internal.products.markNotificationsNotified, {
      notificationIds,
    });
  },
});
