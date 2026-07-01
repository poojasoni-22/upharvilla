# 🛠️ Technical Requirement Document (TRD) — UpharVilla

## 1. System Architecture
UpharVilla utilizes a modern serverless stack consisting of:
* **Frontend:** Next.js (App Router, React, Tailwind CSS / Custom CSS, Typescript).
* **Backend & Database:** Convex (Serverless database, queries, mutations, actions, crons).
* **Payments:** Razorpay REST API (order creation) + Razorpay Web Checkout SDK.
* **Email Gateways:** 
  * **Brevo REST API (SMTP / Transactional):** Handles all e-commerce notification emails.
  * **Resend SDK:** Handles security, authentication, and login emails via Better Auth.

---

## 2. Database Schema Definition

Relevant database schemas configured in [convex/schema.ts](file:///c:/Users/Ritesh%20Sinha/OneDrive/Desktop/Client_Projects/upharvilla/convex/schema.ts):

### `reservations`
Manages temporary stock locks during checkout.
```typescript
reservations: defineTable({
  userId: v.id("users"),
  productId: v.id("products"),
  quantity: v.number(),
  expiresAt: v.number(),      // Unix timestamp (epoch milliseconds)
  status: v.union(v.literal("reserved"), v.literal("completed"), v.literal("released")),
})
.index("by_user_active", ["userId", "status"])
.index("by_product_active", ["productId", "status"])
.index("by_expires_at", ["expiresAt"])
```

### `orders`
Stores completed orders post-payment.
```typescript
orders: defineTable({
  userId: v.id("users"),
  items: v.array(v.object({
    productId: v.id("products"),
    name: v.string(),
    quantity: v.number(),
    price: v.number(),
    thumbnail: v.optional(v.string()),
  })),
  totalAmount: v.number(),
  address: v.string(),
  paymentId: v.string(),        // Razorpay payment ID
  razorpayOrderId: v.string(),  // Razorpay order ID
  orderStatus: v.union(v.literal("placed"), v.literal("processing"), v.literal("shipped"), v.literal("delivered")),
  createdAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_status_created", ["orderStatus", "createdAt"])
```

### `carts`
Stores user shopping cart items.
```typescript
carts: defineTable({
  userId: v.id("users"),
  productId: v.id("products"),
  quantity: v.number(),
  createdAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_user_and_product", ["userId", "productId"])
.index("by_created_at", ["createdAt"])
```
```

---

## 3. Key Backend Operations

### A. Stock Reservation (`convex/checkout.ts`)
Calculates net available stock dynamically by checking the base product inventory and subtracting all active, unexpired reservations by other users:
$$\text{Net Stock} = \text{Product Inventory} - \sum \text{Active Unexpired Reservations}$$
* If sufficient, inserts a reservation record set to expire in 10 minutes (`Date.now() + 600000`).
* Releases any previous uncompleted reservations for the calling user.

### B. Secure Signature Verification (`convex/checkout.ts`)
To prevent payment spoofing, the verification checks the signature on the server using **Web Crypto APIs** (standard in Convex runtimes, instead of Node's `crypto` module):
```typescript
const message = `${razorpayOrderId}|${razorpayPaymentId}`;
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(keySecret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);
const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
  .map(b => b.toString(16).padStart(2, "0"))
  .join("");

const isValid = generatedSignature === razorpaySignature;
```

---

## 4. Email Dispatch Engine (`convex/emails/`)

### A. REST Fetch Protocol
Because standard Node SDKs can trigger size or runtime compatibility warnings inside Convex, Brevo emails are sent using a raw HTTP POST request via native `fetch`:
* **Endpoint:** `https://api.brevo.com/v3/smtp/email`
* **Authorization Header:** `api-key` header mapped to `process.env.BREVO_API_KEY`.

### B. Shared Brand Layout ([emailLayout.ts](file:///c:/Users/Ritesh%20Sinha/OneDrive/Desktop/Client_Projects/upharvilla/convex/emails/emailLayout.ts))
Exposes unified HTML modules:
* `B` (Theme config object containing `#ad8de9` primary purple, `#e87fa6` accent pink, fonts, and borders).
* `emailHeader(tagline)`: Renders logo image hosted from live server.
* `emailFooter()`: Appends copyright, visit site link, and support email link.
* `emailWrapper(body)`: Generates full standard HTML shell (responsive width 600px, font settings, shadow container).

### C. Sender Routing & Fallback Protection
The sending client (`brevoClient.ts`) supports custom template-level sender overrides:
```typescript
const sender = payload.sender || { name: defaultSenderName, email: defaultSenderEmail };
```
* **Wildcard Domain Benefit:** Since `upharvilla.in` is authenticated on Brevo via DKIM/SPF, custom senders like `orders@upharvilla.in`, `support@upharvilla.in`, and `hello@upharvilla.in` are permitted to send automatically.
* **Fallback Protection:** If the custom senders are blocked/unconfigured, the backend automatically falls back to `BREVO_SENDER_EMAIL` from env vars.

---

## 5. Cron Job Scheduling Configuration ([convex/crons.ts](file:///c:/Users/Ritesh%20Sinha/OneDrive/Desktop/Client_Projects/upharvilla/convex/crons.ts))
Convex automates background cron checks without requiring a separate server:

* **Daily at 10:00 AM IST:** Triggers `sendOrderReminders` to notify customers of packing statuses.
* **Daily at 11:00 AM IST:** Triggers `sendCartFollowUps` to recover abandoned shopping carts.
* **Daily at 12:00 PM IST:** Triggers `sendThankYouEmails` for recently delivered orders.
* **Daily at 1:00 PM IST:** Triggers `sendReviewRequests` to request customer feedback.
* **Daily at 4:30 AM IST (22:30 UTC):** Triggers `purgeStaleDatabaseRecords` to clean up expired stock locks and old carts.
