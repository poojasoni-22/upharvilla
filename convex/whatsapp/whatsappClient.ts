// ── WhatsApp Business Cloud API Client ────────────────────────────────────────
// Uses Meta WhatsApp Cloud API via native fetch — works in Convex V8.
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages

import { env } from "../env";

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  parameters: Array<{
    type: "text" | "currency" | "date_time" | "image";
    text?: string;
    image?: { link: string };
  }>;
}

export interface WhatsAppPayload {
  to: string; // E.164 phone: "+919876543210"
  templateName: string; // Pre-approved template name
  languageCode: string; // "en" or "hi"
  components?: WhatsAppTemplateComponent[];
}

/**
 * Send a template message via WhatsApp Business Cloud API.
 * Call from Convex internalActions only — never from mutations/queries.
 * Gracefully skips if credentials are missing so checkout is never blocked.
 */
export async function sendWhatsAppMessage(
  payload: WhatsAppPayload,
): Promise<void> {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.warn(
      "[WhatsApp] Missing credentials — skipped:",
      payload.templateName,
      "→",
      payload.to,
    );
    return;
  }

  const body = {
    messaging_product: "whatsapp",
    to: payload.to,
    type: "template",
    template: {
      name: payload.templateName,
      language: { code: payload.languageCode },
      components: payload.components || [],
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`[WhatsApp] Failed ${response.status}:`, err);
    throw new Error(`WhatsApp API returned status ${response.status}: ${err}`);
  }
}
