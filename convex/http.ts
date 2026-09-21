import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth/auth";
import { env } from "./env";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// ── Razorpay Webhook Handler ──────────────────────────────────────────────────
// Endpoint: POST /razorpay-webhook
//
// Why this exists:
//   The Razorpay payment flow relies on a browser-side `handler()` callback to
//   call `completeCheckout`. If the browser closes, crashes, or loses network
//   after Razorpay captures money but before the callback fires, the customer
//   is charged but receives no order.
//
//   This webhook listens for `payment.captured` events from Razorpay's servers,
//   verifies the signature cryptographically, and triggers `_recoverPaymentFromWebhook`
//   to create the missing order — fully idempotent (safe to call multiple times).
//
// Setup (one-time in Razorpay Dashboard):
//   Dashboard → Settings → Webhooks → Add New Webhook
//   URL:     https://<your-convex-deployment>.convex.site/razorpay-webhook
//   Events:  ✅ payment.captured
//   Secret:  Set a strong random secret → add as RAZORPAY_WEBHOOK_SECRET env var in Convex
//
http.route({
  path: "/razorpay-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Read the raw body — we need it as text for signature verification
    const rawBody = await request.text();

    // 2. Verify Razorpay webhook signature (HMAC-SHA256 of raw body)
    //    X-Razorpay-Signature header contains hex(HMAC-SHA256(rawBody, webhookSecret))
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    let signatureValid = false;
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody),
      );
      const expected = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Constant-time comparison to prevent timing attacks
      if (expected.length === signature.length) {
        let mismatch = 0;
        for (let i = 0; i < expected.length; i++) {
          mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
        }
        signatureValid = mismatch === 0;
      }
    } catch (err) {
      console.error("[Webhook] Signature verification threw:", err);
      return new Response("Signature verification failed", { status: 400 });
    }

    if (!signatureValid) {
      console.warn("[Webhook] Invalid Razorpay signature — request rejected");
      return new Response("Invalid signature", { status: 400 });
    }

    // 3. Parse the verified payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const event: string = payload?.event ?? "";

    // 4. Only handle payment.captured — ignore all other events
    if (event !== "payment.captured") {
      // Return 200 so Razorpay doesn't retry other events
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentEntity = payload?.payload?.payment?.entity;
    const razorpayOrderId: string = paymentEntity?.order_id ?? "";
    const razorpayPaymentId: string = paymentEntity?.id ?? "";
    const amountPaise: number = paymentEntity?.amount ?? 0; // already in paise from Razorpay

    if (!razorpayOrderId || !razorpayPaymentId || !amountPaise) {
      console.error("[Webhook] Missing required fields in payload", {
        razorpayOrderId,
        razorpayPaymentId,
        amountPaise,
      });
      return new Response("Missing payment fields", { status: 400 });
    }

    // 5. Trigger recovery mutation (idempotent — safe if order already exists)
    try {
      const result = await ctx.runMutation(
        internal.checkout._recoverPaymentFromWebhook,
        {
          razorpayOrderId,
          razorpayPaymentId,
          amountPaise,
        },
      );

      console.log(`[Webhook] Recovery result for ${razorpayOrderId}:`, result);

      return new Response(JSON.stringify({ received: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("[Webhook] Recovery mutation failed:", err);
      // Return 500 so Razorpay retries the webhook
      return new Response("Recovery failed — will retry", { status: 500 });
    }
  }),
});

export default http;
