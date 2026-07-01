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

export const sendEnquiryAutoReply = internalAction({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const firstName = args.name.split(" ")[0];

    const body = `
      ${emailHeader("We got your message! 💌")}
      <tr><td style="padding:28px 24px 0;text-align:center;">

        <!-- Avatar icon -->
        <div style="width:64px;height:64px;background:${B.pinkLight};border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">
          💌
        </div>

        <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${B.textDark};font-family:Poppins,Arial,sans-serif;">
          Hi ${firstName}! 👋
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:${B.textMid};line-height:1.8;font-family:Poppins,Arial,sans-serif;max-width:420px;margin-left:auto;margin-right:auto;">
          Thank you for reaching out! We've received your message and our team will get back to you within <strong style="color:${B.primary};">24 hours</strong>.
        </p>
      </td></tr>

      <tr><td style="padding:0 24px;">
        <!-- Promise card -->
        <table cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#f7f4fe,#fce7f0);border:1px solid ${B.border};border-radius:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:18px 20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#6b21a8;font-family:Poppins,Arial,sans-serif;">⏰ Response time</p>
              <p style="margin:0;font-size:28px;font-weight:700;color:${B.primary};font-family:Poppins,Arial,sans-serif;">Within 24 hrs</p>
              <p style="margin:4px 0 0;font-size:12px;color:${B.textLight};font-family:Poppins,Arial,sans-serif;">Mon – Sat, 9am – 7pm IST</p>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 8px;font-size:14px;color:${B.textMid};text-align:center;font-family:Poppins,Arial,sans-serif;">
          While you wait, browse our latest gift collections!
        </p>

        ${ctaButton("Explore Gifts →", BASE_URL)}
      </td></tr>

      <tr><td style="height:32px;"></td></tr>
      ${emailFooter()}
    `;

    const templateIdStr = process.env.BREVO_TEMPLATE_ENQUIRY_AUTOREPLY;
    const templateId = templateIdStr ? parseInt(templateIdStr, 10) : undefined;

    if (templateId && !Number.isNaN(templateId)) {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.email, name: args.name }],
        replyTo: { email: "support@upharvilla.in", name: "upharVilla Support" },
        templateId,
        params: JSON.stringify({
          name: args.name,
          firstName,
          email: args.email,
        }),
        tags: ["enquiry-autoreply"],
      });
    } else {
      await ctx.runMutation(internal.emails.queue.enqueue, {
        to: [{ email: args.email, name: args.name }],
        subject: `We got your message, ${firstName}! — upharVilla`,
        htmlContent: emailWrapper(body),
        sender: { email: "contact@upharvilla.in", name: "upharVilla" },
        replyTo: { email: "support@upharvilla.in", name: "upharVilla Support" },
        tags: ["enquiry-autoreply"],
      });
    }

    await ctx.runAction(internal.emails.queue.processQueue);
  },
});
