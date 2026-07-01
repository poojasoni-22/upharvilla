import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
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

export const _getUsersWithStaleCarts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;

    const oldCarts = await ctx.db
      .query("carts")
      .withIndex("by_created_at", (q) => q.lt("createdAt", cutoff))
      .collect();

    const userMap = new Map<
      string,
      { userId: string; itemCount: number; productIds: Id<"products">[] }
    >();
    for (const cart of oldCarts) {
      const ex = userMap.get(cart.userId);
      if (!ex) {
        userMap.set(cart.userId, {
          userId: cart.userId,
          itemCount: 1,
          productIds: [cart.productId],
        });
      } else {
        ex.itemCount++;
        if (ex.productIds.length < 3) ex.productIds.push(cart.productId);
      }
    }

    const results: Array<{
      email: string;
      name: string;
      itemCount: number;
      products: Array<{
        name: string;
        thumbnail: string;
        price: number;
        slug: string;
      }>;
    }> = [];

    for (const entry of userMap.values()) {
      const recentOrders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", entry.userId as any))
        .collect();
      if (recentOrders.some((o) => o.createdAt > cutoff)) continue;

      const user = await ctx.db
        .query("user")
        .filter((q) => q.eq(q.field("_id"), entry.userId))
        .first();
      if (!user?.email) continue;

      // Fetch product details for thumbnails
      const products: Array<{
        name: string;
        thumbnail: string;
        price: number;
        slug: string;
      }> = [];
      for (const pid of entry.productIds) {
        const product = await ctx.db.get(pid);
        if (product?.isActive) {
          products.push({
            name: product.name,
            thumbnail: product.thumbnail || "",
            price: product.price,
            slug: product.slug,
          });
        }
      }

      results.push({
        email: user.email,
        name: user.name || "there",
        itemCount: entry.itemCount,
        products,
      });
    }
    return results;
  },
});

export const sendCartFollowUps = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(
      internal.emails.followUpEmail._getUsersWithStaleCarts,
      {},
    );

    for (const user of users) {
      const firstName = user.name.split(" ")[0];

      // Build product cards with thumbnails
      const productCards =
        user.products.length > 0
          ? user.products
              .map((p) =>
                productCard({
                  name: p.name,
                  thumbnail: p.thumbnail,
                  price: p.price,
                  link: `${BASE_URL}/product/${p.slug}`,
                }),
              )
              .join("")
          : "";

      const body = `
        ${emailHeader("You left something special behind 🛒")}
        <tr><td style="padding:28px 24px 0;text-align:center;">
          <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
            Hey ${firstName}! 👀
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:${B.textMid};line-height:1.8;font-family:Poppins,Arial,sans-serif;max-width:420px;margin-left:auto;margin-right:auto;">
            You left <strong style="color:${B.primary};">${user.itemCount} gift${user.itemCount > 1 ? "s" : ""}</strong> in your upharVilla cart.
            They're still available — but stock is limited!
          </p>
        </td></tr>

        <tr><td style="padding:0 24px;">
          <!-- Product thumbnails -->
          ${productCards}

          <!-- Stock urgency card -->
          <table cellpadding="0" cellspacing="0" width="100%" style="background:${B.amberBg};border:1px solid ${B.amberBorder};border-radius:12px;margin:12px 0 20px;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#92400e;font-family:Poppins,Arial,sans-serif;line-height:1.6;">
                ⏰ <strong>Items aren't reserved</strong> until you check out — someone else could grab them!
              </p>
            </td></tr>
          </table>

          ${ctaButton("Complete My Order →", `${BASE_URL}/cart`)}

          <p style="margin:20px 0 0;font-size:12px;color:${B.textLight};text-align:center;font-family:Poppins,Arial,sans-serif;">
            Changed your mind? No worries — gifts will always be here for you. 💜
          </p>
        </td></tr>

        <tr><td style="height:32px;"></td></tr>
        ${emailFooter()}
      `;

      const templateIdStr = process.env.BREVO_TEMPLATE_CART_FOLLOWUP;
      const templateId = templateIdStr
        ? parseInt(templateIdStr, 10)
        : undefined;

      if (templateId && !Number.isNaN(templateId)) {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: user.email, name: user.name }],
          templateId,
          params: JSON.stringify({
            firstName,
            itemCount: user.itemCount,
            cartUrl: `${BASE_URL}/cart`,
          }),
          tags: ["cart-followup"],
        });
      } else {
        await ctx.runMutation(internal.emails.queue.enqueue, {
          to: [{ email: user.email, name: user.name }],
          subject: `🛒 ${firstName}, your cart is waiting — upharVilla`,
          htmlContent: emailWrapper(body),
          sender: { email: "hello@upharvilla.in", name: "upharVilla" },
          tags: ["cart-followup"],
        });
      }
    }

    await ctx.runAction(internal.emails.queue.processQueue);
    console.log(`[FollowUp] Enqueued ${users.length} cart follow-up emails`);
  },
});
