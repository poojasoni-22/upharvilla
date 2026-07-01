// ── Brevo Transactional Email Client ─────────────────────────────────────────
// Uses Brevo REST API via fetch — no SDK, works in Convex V8.
// Docs: https://developers.brevo.com/reference/sendtransacemail

import { env } from "../env";

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoEmailPayload {
  to: BrevoRecipient[];
  subject?: string;
  htmlContent?: string;
  templateId?: number;
  params?: Record<string, any>;
  replyTo?: BrevoRecipient;
  tags?: string[];
  sender?: BrevoRecipient; // Custom sender (optional when using templateId)
}

/**
 * Send a transactional email via Brevo.
 * Call from Convex internalActions only — never from mutations/queries.
 * Logs and swallows errors so email failure never breaks a checkout.
 */
export async function sendBrevoEmail(
  payload: BrevoEmailPayload,
): Promise<void> {
  const apiKey = env.BREVO_API_KEY;
  const defaultSenderEmail = env.BREVO_SENDER_EMAIL;
  const defaultSenderName = env.BREVO_SENDER_NAME;

  if (!apiKey) {
    console.warn(
      "[Brevo] BREVO_API_KEY not set — skipped:",
      payload.subject || `Template #${payload.templateId}`,
      "→",
      payload.to[0]?.email,
    );
    return;
  }

  // Use the payload sender if provided, otherwise fall back to default env variables
  const sender = payload.sender || {
    name: defaultSenderName,
    email: defaultSenderEmail,
  };

  const bodyPayload: any = {
    to: payload.to,
    replyTo: payload.replyTo,
    tags: payload.tags,
  };

  if (payload.templateId) {
    bodyPayload.templateId = payload.templateId;
    bodyPayload.params = payload.params;
  } else {
    bodyPayload.sender = sender;
    bodyPayload.subject = payload.subject;
    bodyPayload.htmlContent = payload.htmlContent;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[Brevo] Failed ${response.status}:`, err);
    throw new Error(`Brevo API returned status ${response.status}: ${err}`);
  }
}
