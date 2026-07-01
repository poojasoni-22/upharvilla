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
} from "./emailLayout";

const BASE_URL = env.SITE_URL;

export const sendOrderConfirmation = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    razorpayPaymentId: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        thumbnail: v.optional(v.string()),
      }),
    ),
    totalAmount: v.number(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const shortId = args.orderId.slice(-8).toUpperCase();

    const itemRows = args.items
      .map(
        (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${B.border};">
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              ${
                item.thumbnail
                  ? `<td width="44" style="padding-right:12px;vertical-align:top;">
                       <img src="${item.thumbnail}" width="44" height="44"
                             style="border-radius:8px;border:1px solid ${B.border};object-fit:cover;display:block;" alt="${item.name}" />
                     </td>`
                  : ""
              }
              <td style="vertical-align:middle;text-align:left;">
                <p style="margin:0;font-size:13px;color:${B.textDark};font-family:Poppins,Arial,sans-serif;font-weight:500;">${item.name}</p>
                <p style="margin:3px 0 0;font-size:12px;color:${B.textLight};font-family:Poppins,Arial,sans-serif;">Qty: ${item.quantity}</p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:600;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </td>
            </tr></table>
          </td>
        </tr>`,
      )
      .join("");

    const body = `
      ${emailHeader("Order Confirmation")}

      <tr><td style="padding:28px 24px 0;text-align:left;">
        <!-- Success badge -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#faf9ff;border:1px solid ${B.border};border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#6b21a8;font-family:Poppins,Arial,sans-serif;">Payment Successful</p>
            <p style="margin:5px 0 0;font-size:13px;color:${B.textMid};font-family:Poppins,Arial,sans-serif;line-height:1.5;">
              Dear ${args.customerName}, Thank you for your order. We have received your payment and our warehouse is processing your items for packaging.
            </p>
          </td></tr>
        </table>

        <!-- Order details summary -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#fcfbfe;border:1px solid ${B.border};border-radius:10px;margin-bottom:24px;border-collapse:collapse;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">Order Details</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${infoRow("Order ID", `#${shortId}`)}
              ${infoRow("Payment Reference", args.razorpayPaymentId)}
              ${infoRow("Delivery Address", args.address)}
            </table>
          </td></tr>
        </table>

        <!-- Items Ordered -->
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${B.textLight};font-family:Poppins,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.8px;">Items Summary</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
          ${itemRows}
        </table>

        <!-- Total Paid -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#fcfaff,#fdf4f7);border:1px solid ${B.border};border-radius:10px;margin-bottom:24px;border-collapse:collapse;">
          <tr>
            <td style="padding:16px 20px;font-size:14px;font-weight:600;color:#6b21a8;font-family:Poppins,Arial,sans-serif;text-align:left;">Amount Paid</td>
            <td style="padding:16px 20px;text-align:right;font-size:20px;font-weight:700;color:${B.primary};font-family:Poppins,Arial,sans-serif;">₹${args.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>

        <!-- Delivery guidelines -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#fdf4f7;border:1px solid #fce7f0;border-radius:12px;margin-bottom:28px;border-collapse:collapse;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#db2777;font-family:Poppins,Arial,sans-serif;">Dispatch Information</p>
            <p style="margin:0;font-size:13px;color:${B.textMid};line-height:1.6;font-family:Poppins,Arial,sans-serif;">
              Your order will be packed and dispatched from our facility within <strong>1–2 business days</strong>. A shipment notification email containing the courier tracking reference will be sent as soon as your package leaves our warehouse.
            </p>
          </td></tr>
        </table>

        ${ctaButton("Continue Shopping", BASE_URL)}
      </td></tr>

      <tr><td style="height:32px;"></td></tr>
      ${emailFooter()}
    `;

    const templateIdStr = process.env.BREVO_TEMPLATE_ORDER_CONFIRMATION;
    const templateId = templateIdStr ? parseInt(templateIdStr, 10) : undefined;

    if (templateId && !Number.isNaN(templateId)) {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.customerEmail, name: args.customerName }],
        templateId,
        params: JSON.stringify({
          customerName: args.customerName,
          orderId: shortId,
          razorpayPaymentId: args.razorpayPaymentId,
          items: args.items,
          totalAmount: args.totalAmount,
          address: args.address,
          dispatchTime: "1–2 business days",
        }),
        tags: ["order-confirmation"],
      });
    } else {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.customerEmail, name: args.customerName }],
        subject: `Order Confirmed: #${shortId}`,
        htmlContent: emailWrapper(body),
        sender: { email: "orders@upharvilla.in", name: "upharVilla Orders" },
        tags: ["order-confirmation"],
      });
    }

    await ctx.runAction(internal.emails.queue.processQueue);
  },
});

export const sendOrderStatusEmail = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    status: v.union(
      v.literal("shipped"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
    ),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        thumbnail: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const shortId = args.orderId.slice(-8).toUpperCase();

    let subject = "";
    let tagline = "";
    let statusMessage = "";
    let reviewSection = "";
    let ctaLabel = "Track Shipment";
    const ctaLink = `${BASE_URL}/my-orders`;

    if (args.status === "shipped") {
      subject = `Order Shipped: #${shortId}`;
      tagline = "Order Dispatched";
      statusMessage = `Your order #${shortId} has been successfully dispatched from our warehouse facility. It is currently in transit with our logistics partner FedEx/BlueDart. You will receive further updates as the shipment approaches your delivery destination.`;
    } else if (args.status === "out_for_delivery") {
      subject = `Order Out for Delivery: #${shortId}`;
      tagline = "Out for Delivery";
      statusMessage = `Your package for order #${shortId} is out for delivery with our local logistics associate and will be delivered to your shipping destination today. Please ensure someone is available at the address to receive it.`;
      ctaLabel = "Track Delivery";
    } else if (args.status === "delivered") {
      subject = `Order Delivered: #${shortId}`;
      tagline = "Order Delivered";
      statusMessage = `Your order #${shortId} has been successfully delivered. We hope you are pleased with your purchase. If you have any inquiries or feedback regarding your order, please do not hesitate to contact our customer support team.`;
      ctaLabel = "Go to My Orders";

      // Build Rate Product Links for each item
      const rateRows = args.items
        .map((item, idx) => {
          const itemId = `${args.orderId}-${item.productId}-${idx}`;
          const ratingUrl = `${BASE_URL}/my-orders?openReview=${itemId}`;
          return `
          <tr style="border-bottom:1px solid ${B.border};">
            <td style="padding:12px 0;font-size:12px;color:${B.textDark};font-family:Poppins,Arial,sans-serif;font-weight:500;vertical-align:middle;text-align:left;">
              ${item.name}
            </td>
            <td style="padding:12px 0;text-align:right;vertical-align:middle;">
              <a href="${ratingUrl}" style="display:inline-block;padding:8px 18px;background:${B.primary};color:#ffffff;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;font-family:Poppins,Arial,sans-serif;white-space:nowrap;">
                Rate Product
              </a>
            </td>
          </tr>
        `;
        })
        .join("");

      reviewSection = `
        <!-- Review Section -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#fcfaff;border:1px solid ${B.border};border-radius:12px;margin:24px 0 16px;border-collapse:collapse;">
          <tr>
            <td colspan="2" style="padding:16px 20px 8px;text-align:left;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#6b21a8;font-family:Poppins,Arial,sans-serif;">Product Feedback</p>
              <p style="margin:4px 0 0;font-size:11px;color:${B.textMid};font-family:Poppins,Arial,sans-serif;">Please take a moment to rate and review the products in your delivery.</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 24px 16px;">
              <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                ${rateRows}
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    const body = `
      ${emailHeader(tagline)}
      <tr><td style="padding:28px 24px 0;text-align:left;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4fe;border:1px solid ${B.border};border-radius:12px;margin-bottom:24px;border-collapse:collapse;">
          <tr><td style="padding:16px 20px;text-align:left;">
            <p style="margin:0;font-size:14px;color:${B.textDark};line-height:1.6;font-family:Poppins,Arial,sans-serif;">
              Dear ${args.customerName},
            </p>
            <p style="margin:8px 0 0;font-size:13px;color:${B.textMid};line-height:1.6;font-family:Poppins,Arial,sans-serif;">
              ${statusMessage}
            </p>
          </td></tr>
        </table>

        <!-- Order Summary Card -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;background:#fcfbfe;border-radius:8px;border:1px dashed ${B.border};border-collapse:collapse;">
          <tr>
            <td style="padding:12px 16px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                ${infoRow("Order ID", `#${shortId}`)}
                ${infoRow("Delivery Status", args.status.replace(/_/g, " ").toUpperCase())}
              </table>
            </td>
          </tr>
        </table>

        ${reviewSection}

        ${ctaButton(ctaLabel, ctaLink)}
      </td></tr>
      <tr><td style="height:32px;"></td></tr>
      ${emailFooter()}
    `;

    const templateIdStr = process.env.BREVO_TEMPLATE_ORDER_STATUS_UPDATE;
    const templateId = templateIdStr ? parseInt(templateIdStr, 10) : undefined;

    if (templateId && !Number.isNaN(templateId)) {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.customerEmail, name: args.customerName }],
        templateId,
        params: JSON.stringify({
          customerName: args.customerName,
          orderId: shortId,
          status: args.status,
          statusMessage,
          tagline,
          items: args.items,
          ctaLabel,
          ctaLink,
          hasReviewSection: args.status === "delivered",
        }),
        tags: [`order-status-${args.status}`],
      });
    } else {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.customerEmail, name: args.customerName }],
        subject,
        htmlContent: emailWrapper(body),
        sender: { email: "orders@upharvilla.in", name: "upharVilla Orders" },
        tags: [`order-status-${args.status}`],
      });
    }

    await ctx.runAction(internal.emails.queue.processQueue);
  },
});
