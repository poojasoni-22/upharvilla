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
  infoRow,
  productCard,
} from "./emailLayout";

const BASE_URL = env.SITE_URL;
const ADMIN_EMAIL = env.BREVO_SENDER_EMAIL;

// ── Admin: New Order Notification ─────────────────────────────────────────────
export const notifyAdminNewOrder = internalAction({
  args: {
    orderId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        thumbnail: v.optional(v.string()),
      }),
    ),
    totalAmount: v.number(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const shortId = args.orderId.slice(-8).toUpperCase();

    // Product cards with thumbnails
    const itemCards = args.items
      .map((i) =>
        productCard({
          name: i.name,
          thumbnail: i.thumbnail,
          price: i.price * i.quantity,
          subtitle: `Qty: ${i.quantity}`,
        }),
      )
      .join("");

    const body = `
      ${emailHeader("New order received 🛒")}
      <tr><td style="padding:28px 24px 0;">

        <!-- Alert banner -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a2e;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:18px 22px;">
            <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;font-family:Poppins,Arial,sans-serif;">Order #${shortId}</p>
            <p style="margin:5px 0 0;font-size:13px;color:rgba(255,255,255,0.65);font-family:Poppins,Arial,sans-serif;">₹${args.totalAmount.toLocaleString("en-IN")} · Payment confirmed via Razorpay</p>
          </td></tr>
        </table>

        <!-- Customer info -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4fe;border-radius:10px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">Customer</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${infoRow("Name", args.customerName)}
              ${infoRow("Email", args.customerEmail)}
              ${infoRow("Ship to", args.address)}
            </table>
          </td></tr>
        </table>

        <!-- Items with product images -->
        <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">Items Ordered</p>
        ${itemCards}

        <!-- Total -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#f7f4fe,#fce7f0);border:1px solid ${B.border};border-radius:10px;margin:12px 0 24px;">
          <tr>
            <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#6b21a8;font-family:Poppins,Arial,sans-serif;">Order Total</td>
            <td style="padding:14px 20px;text-align:right;font-size:20px;font-weight:700;color:${B.primary};font-family:Poppins,Arial,sans-serif;">₹${args.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>

        ${ctaButton("View in Admin Panel →", `${BASE_URL}/admin/orders`)}
      </td></tr>
      <tr><td style="height:32px;"></td></tr>
      ${emailFooter()}
    `;

    const templateIdStr = process.env.BREVO_TEMPLATE_ADMIN_ORDER_ALERT;
    const templateId = templateIdStr ? parseInt(templateIdStr, 10) : undefined;

    if (templateId && !Number.isNaN(templateId)) {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: ADMIN_EMAIL, name: "upharVilla Admin" }],
        templateId,
        params: JSON.stringify({
          orderId: shortId,
          customerName: args.customerName,
          customerEmail: args.customerEmail,
          items: args.items,
          totalAmount: args.totalAmount,
          address: args.address,
          adminUrl: `${BASE_URL}/admin/orders`,
        }),
        tags: ["admin-order"],
      });
    } else {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: ADMIN_EMAIL, name: "upharVilla Admin" }],
        subject: `🛒 New Order #${shortId} — ₹${args.totalAmount.toLocaleString("en-IN")} from ${args.customerName}`,
        htmlContent: emailWrapper(body),
        sender: { email: "orders@upharvilla.in", name: "upharVilla Orders" },
        tags: ["admin-order"],
      });
    }

    await ctx.runAction(internal.emails.queue.processQueue);
  },
});

// ── Admin: New Enquiry Notification ──────────────────────────────────────────
export const notifyAdminNewEnquiry = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const body = `
      ${emailHeader("New enquiry received 📩")}
      <tr><td style="padding:28px 24px 0;">

        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4fe;border-radius:10px;margin-bottom:20px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">From</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${infoRow("Name", args.name)}
              ${infoRow("Email", args.email)}
              ${args.phone ? infoRow("Phone", args.phone) : ""}
            </table>
          </td></tr>
        </table>

        <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">Message</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4fe;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:18px 20px;font-size:14px;color:${B.textMid};line-height:1.7;font-family:Poppins,Arial,sans-serif;">
            ${args.message}
          </td></tr>
        </table>

        ${ctaButton(`Reply to ${args.name} →`, `mailto:${args.email}`)}
      </td></tr>
      <tr><td style="height:32px;"></td></tr>
      ${emailFooter()}
    `;

    const templateIdStr = process.env.BREVO_TEMPLATE_ADMIN_ENQUIRY_ALERT;
    const templateId = templateIdStr ? parseInt(templateIdStr, 10) : undefined;

    if (templateId && !Number.isNaN(templateId)) {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: ADMIN_EMAIL, name: "upharVilla Admin" }],
        replyTo: { email: args.email, name: args.name },
        templateId,
        params: JSON.stringify({
          name: args.name,
          email: args.email,
          phone: args.phone || "",
          message: args.message,
          replyUrl: `mailto:${args.email}`,
        }),
        tags: ["admin-enquiry"],
      });
    } else {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: ADMIN_EMAIL, name: "upharVilla Admin" }],
        subject: `📩 New Enquiry from ${args.name}`,
        htmlContent: emailWrapper(body),
        sender: { email: "admin@upharvilla.in", name: "upharVilla Admin" },
        replyTo: { email: args.email, name: args.name },
        tags: ["admin-enquiry"],
      });
    }

    await ctx.runAction(internal.emails.queue.processQueue);
  },
});
