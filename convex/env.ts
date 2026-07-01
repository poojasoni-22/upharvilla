// ── Central Validated Backend Environment Configuration ──────────────────────
// Uses JavaScript getters to validate environment keys on-demand at runtime.
// This prevents cold start/codegen build crashes while ensuring strict type safety.

export const env = {
  // ── Brevo / Email Configuration ──────────────────────────────────────────
  get BREVO_API_KEY(): string {
    const key = process.env.BREVO_API_KEY;
    if (!key) {
      throw new Error("Missing environment variable: BREVO_API_KEY");
    }
    return key;
  },

  get BREVO_SENDER_EMAIL(): string {
    return process.env.BREVO_SENDER_EMAIL || "support@upharvilla.in";
  },

  get BREVO_SENDER_NAME(): string {
    return process.env.BREVO_SENDER_NAME || "UpharVilla";
  },

  get SITE_URL(): string {
    return process.env.SITE_URL || "https://upharvilla.in";
  },

  // ── Razorpay Configuration ──────────────────────────────────────────────
  get RAZORPAY_KEY_ID(): string {
    const key = process.env.RAZORPAY_KEY_ID;
    if (!key) {
      throw new Error("Missing environment variable: RAZORPAY_KEY_ID");
    }
    return key;
  },

  get RAZORPAY_KEY_SECRET(): string {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Missing environment variable: RAZORPAY_KEY_SECRET");
    }
    return secret;
  },

  // ── Optional Brevo Template IDs (Parsed to Numbers) ──────────────────────
  get BREVO_TEMPLATE_ORDER_CONFIRMATION(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ORDER_CONFIRMATION;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_ORDER_STATUS_UPDATE(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ORDER_STATUS_UPDATE;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_ADMIN_ORDER_ALERT(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ADMIN_ORDER_ALERT;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_ADMIN_ENQUIRY_ALERT(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ADMIN_ENQUIRY_ALERT;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_ENQUIRY_AUTOREPLY(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ENQUIRY_AUTOREPLY;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_ORDER_REMINDER(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_ORDER_REMINDER;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_RESTOCK_NOTIFICATION(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_RESTOCK_NOTIFICATION;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_CART_FOLLOWUP(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_CART_FOLLOWUP;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_THANK_YOU(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_THANK_YOU;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  get BREVO_TEMPLATE_REVIEW_REQUEST(): number | undefined {
    const val = process.env.BREVO_TEMPLATE_REVIEW_REQUEST;
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  },

  // ── WhatsApp Business Cloud API ───────────────────────────────────────────
  get WHATSAPP_ACCESS_TOKEN(): string {
    return process.env.WHATSAPP_ACCESS_TOKEN || "";
  },

  get WHATSAPP_PHONE_NUMBER_ID(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  },
};
