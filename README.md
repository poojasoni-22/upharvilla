# 🎁 UpharVilla — Premium E-Commerce Platform

Welcome to the comprehensive documentation repository for **UpharVilla**, a premium, high-end e-commerce platform specializing in curated gifts. This document serves as the master source of knowledge for the client, developers, and administrators managing the system.

---

## 📌 Table of Contents
1. [Product Overview & Vision](#-product-overview--vision)
2. [Tech Stack](#-tech-stack)
3. [System Architecture & Key Features](#-system-architecture--key-features)
   - [Inventory Lock & Stock Reservation](#1-inventory-lock--stock-reservation)
   - [Secure Razorpay Payment Integration](#2-secure-razorpay-payment-integration)
   - [Branded Transactional Email System](#3-branded-transactional-email-system)
   - [Cron Job Automation](#4-cron-job-automation)
   - [WhatsApp Notification Engine](#5-whatsapp-notification-engine)
4. [Project Directory Structure](#-project-directory-structure)
5. [Database Schema (`Convex`)](#-database-schema-convex)
6. [Environment Setup & Configuration](#-environment-setup--configuration)
7. [Running the Application Locally](#-running-the-application-locally)
8. [Deployment Guide](#-deployment-guide)
9. [📧 Brevo Deliverability & DNS Setup](#-brevo-deliverability--dns-setup)
10. [📱 Meta WhatsApp Cloud API & Template Setup](#-meta-whatsapp-cloud-api--template-setup)

---

## 🌟 Product Overview & Vision

**UpharVilla** is designed to deliver a premium, seamless, and trustworthy shopping experience. The key objectives are:
* **Zero Double-Selling:** Real-time stock locks prevent two customers from checking out the same single gift item at the exact same moment.
* **Modern & Delightful UI:** Highly responsive web experience built with premium aesthetics (lavender purple `#ad8de9` and pink accent `#e87fa6`).
* **Automated Customer Lifecycles:** Consistent, beautiful communication (transactional emails and follow-ups) that builds long-term customer trust.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | [Next.js 16 (App Router)](https://nextjs.org/) | React-based server-rendered framework, routing, and UI layout. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS | Sleek styling, custom colors, and responsive layouts. |
| **Backend & DB**| [Convex](https://www.convex.dev/) | Serverless database, reactive queries, mutations, actions, and server crons. |
| **Authentication**| [Better Auth](https://www.better-auth.com/) | Secure OAuth, email/OTP, and session management. |
| **Payments** | [Razorpay SDK & API](https://razorpay.com/) | Payment processing and cryptographic signature verification. |
| **Email (Store)** | [Brevo REST API](https://www.brevo.com/) | High-deliverability transactional emails and scheduled crons. |
| **Email (Auth)** | [Resend](https://resend.com/) | Delivering authentication emails, OTPs, and password resets. |
| **Media Hosting** | [ImageKit](https://imagekit.io/) | Fast CDN, media optimization, and image storage. |
| **Linter / Formatter**| [Biome](https://biomejs.dev/) | Blazing fast formatting and code-quality checks. |

---

## ⚙️ System Architecture & Key Features

### 1. Inventory Lock & Stock Reservation
To maintain absolute inventory integrity, UpharVilla implements a custom temporary reservation engine:
* **How it works:** When a customer lands on the `/checkout` page, their cart items are immediately reserved in the database using the `reservations` table.
* **10-Minute Lock:** The reservation creates a lock with an expiration epoch (`Date.now() + 600000`). The UI displays a live countdown timer (`10:00` to `00:00`).
* **Auto-Release:** If the checkout timer runs out, the locked stock is automatically released back to the general inventory. Returning to the cart page or exiting checkout also releases the lock immediately.
* **Concurrency Protection:** Net available stock is calculated dynamically:
  $$\text{Net Stock} = \text{Product Inventory} - \sum \text{Active Unexpired Reservations}$$

### 2. Secure Razorpay Payment Integration
* **Double Verification:** Payments are initialized backend-side using the Razorpay API. Once the user pays via the Razorpay Web Checkout Overlay, the transaction signature is verified on the server using **Web Crypto APIs** (`crypto.subtle.sign` in Convex) before committing the order.
* **Order Settlement:** On successful verification:
  1. Reserved inventory is permanently deducted.
  2. The reservation status changes from `"reserved"` to `"completed"`.
  3. The customer's cart is cleared.
  4. An order record is saved, and a confirmation email is triggered.

### 3. Branded Transactional Email System
The platform utilizes **Brevo's REST API** (using native `fetch` inside Convex for maximum compatibility) to dispatch styled emails in UpharVilla's brand palette:
* **Custom Sender Domains:** Authentication allows emails to come directly from `orders@upharvilla.in`, `support@upharvilla.in`, or `hello@upharvilla.in`.
* **Standard HTML Wrappers:** Uniform templates ensure every communication uses the signature lavender/pink layout, complete with headers, footers, social links, and typography.
* **Instant Notifications:** Automatic confirmation alerts are sent to both the Customer and the Admin upon new order placement. Contact/Enquiry submissions trigger an auto-response to the customer and alert the admin with a quick-reply `mailto:` action.

### 4. Cron Job Automation
Located at `convex/crons.ts`, Convex automates background schedules:
* **10:00 AM IST:** `sendOrderReminders` — Alerts customer their gift packing is underway.
* **11:00 AM IST:** `sendCartFollowUps` — Triggers abandoned cart emails for carts >24 hours old.
* **12:00 PM IST:** `sendThankYouEmails` — Sent post-delivery.
* **1:00 PM IST:** `sendReviewRequests` — Star-rating review requests sent 48-72 hours post-delivery.
* **4:30 AM IST (22:30 UTC):** `purgeStaleDatabaseRecords` — Maintenance script to clean up expired stock locks and old carts.

### 5. WhatsApp Notification Engine
UpharVilla integrates with the **Meta WhatsApp Business Cloud API** to send critical transactional updates. Each notification features a dynamic product image header (usually displaying the thumbnail of the first item purchased) alongside clean, formal text updates.
* **Supported Events:** Order Confirmed, Order Shipped, Out for Delivery, and Order Delivered.

---

## 📂 Project Directory Structure

```text
src/app/
├── layout.tsx                    ← Root layout (Convex, BetterAuth, Theme Providers)
├── (ecommerce)/
│   ├── layout.tsx                ← Public Ecommerce layout (Navbar, Footer)
│   ├── page.tsx                  ← HOME "/" (All products listed)
│   ├── products/
│   │   ├── page.tsx              ← Product listing page "/products"
│   │   └── [id]/
│   │       └── page.tsx          ← Individual Product Detail "/products/[id]"
│   ├── cart/
│   │   └── page.tsx              ← Customer Cart "/cart" (Protected)
│   ├── wishlist/
│   │   └── page.tsx              ← Wishlist page "/wishlist" (Protected)
│   └── checkout/
│       └── page.tsx              ← Checkout & Payment Gateway "/checkout" (Protected)
│
├── (auth)/
│   └── auth/
│       └── page.tsx              ← Authentication gateway / login "/auth"
│
└── (admin)/
    ├── layout.tsx                ← Admin layout (Sidebar navigation, no public header)
    └── admin/
        ├── page.tsx              ← Admin Dashboard Home "/admin"
        └── inventory/
            └── page.tsx          ← Stock & Catalog Control "/admin/inventory"
```

---

## 🗄️ Database Schema (Convex)

The schema defines critical transactional records in `convex/schema.ts`:

### Reservations
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

### Orders
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

---

## 🔑 Environment Setup & Configuration

To run UpharVilla, prepare two categories of environment variables. Reference the template in `.env.example`.

### Section A: Backend Variables (Convex Dashboard)
Configure these on your [Convex Dashboard Settings](https://dashboard.convex.dev):

* **Better Auth:**
  * `BETTER_AUTH_SECRET`: Generate a random secure hash.
  * `SITE_URL`: Frontend site URL (e.g., `http://localhost:3000` or production URL).
* **OAuth Credentials:**
  * `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  * `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`
* **Razorpay Private credentials:**
  * `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
* **Emails:**
  * `RESEND_API_KEY`: For auth emails (`support@upharvilla.in`).
  * `BREVO_API_KEY`: API key for Brevo transactional delivery.
  * `BREVO_SENDER_EMAIL` & `BREVO_SENDER_NAME` (e.g. `hello@upharvilla.in`, `UpharVilla`).
* **Meta WhatsApp Cloud API:**
  * `WHATSAPP_ACCESS_TOKEN` & `WHATSAPP_PHONE_NUMBER_ID`

### Section B: Frontend Variables (Vercel / Local `.env.local`)
* `NEXT_PUBLIC_SITE_URL`: Site URL.
* `CONVEX_DEPLOYMENT`: e.g. `dev:gift-box-1234`
* `NEXT_PUBLIC_CONVEX_URL`: `https://...convex.cloud`
* `NEXT_PUBLIC_CONVEX_SITE_URL`: `https://...convex.site`
* `CONVEX_DEPLOY_KEY`: Deployment key for deployment updates.
* `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` & `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
* `NEXT_PUBLIC_RAZORPAY_KEY_ID`

---

## 🚀 Running the Application Locally

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run Dev Environment:**
   This starts the Next.js server locally and initializes the Convex backend synchronization:
   ```bash
   pnpm run dev
   ```

3. **Check Code Quality (Biome):**
   ```bash
   pnpm run lint    # Check formatting and lint rules
   pnpm run format  # Auto-fix code styling issues
   ```

---

## 📦 Deployment Guide

UpharVilla deploys dynamically across Convex and Vercel:

### 1. Build and Deploy Convex Functions
To build the app and trigger a production Convex database synchronization, run:
```bash
pnpm run build
```
This commands runs `npx convex deploy --cmd 'next build'` behind the scenes, deploying your database schema, serverless queries, and crons directly to the live Convex database node, then compile the Next.js production bundle.

### 2. Deploy Frontend (Vercel)
Connect your GitHub repository to Vercel. Ensure all environment variables from Section B are mapped in Vercel. Vercel will automatically build the Next.js bundle and deploy to production on every push to the `main` branch.

---

## 📧 Brevo Deliverability & DNS Setup

To ensure emails are sent directly to customer inboxes and not marked as spam by Gmail/Yahoo, domain authentication must be set up at your DNS registrar (e.g. Cloudflare, GoDaddy).

### 1. DNS Records Setup
Add the following TXT records to the root of your domain `upharvilla.in`:

* **DKIM (DomainKeys Identified Mail):**
  * **Type:** `TXT`
  * **Host/Name:** `mail._domainkey` (or value provided by Brevo)
  * **Value:** *(Retrieve DKIM key from Brevo: Senders & IP > Domains)*
* **SPF (Sender Policy Framework):**
  * **Type:** `TXT`
  * **Host/Name:** `@` (or leave empty)
  * **Value:** `v=spf1 include:spf.sendinblue.com ~all`
  * *(Note: If you have an existing SPF record, merge it: `v=spf1 include:_spf.google.com include:spf.sendinblue.com ~all`)*
* **DMARC:**
  * **Type:** `TXT`
  * **Host/Name:** `_dmarc`
  * **Value:** `v=DMARC1; p=none; rua=mailto:dmarc-reports@upharvilla.in`

### 2. Authorizing Senders in Brevo Dashboard
Go to **Senders & IP > Senders** in your Brevo Dashboard and verify the following senders:
1. `hello@upharvilla.in` (Primary brand support)
2. `orders@upharvilla.in` (Dedicated transactional notifications)
3. `support@upharvilla.in` (Contact & Help Desk replies)

### 3. Migrating to Hosted Templates (Optional)
Currently, the Convex code sends beautifully pre-generated HTML directly. To shift styling responsibility to Brevo's drag-and-drop builder:
1. Design your email template inside **Brevo > Transactional > Templates** and note its **Template ID** (e.g., `12`).
2. Update the enqueuing logic in Convex to specify `templateId` and variables instead of `htmlContent`:
   ```typescript
   await ctx.runMutation(internal.emails.queue.enqueue, {
     to: [{ email: args.customerEmail, name: args.customerName }],
     subject: `Order Confirmed: #${shortId}`,
     templateId: 12,
     params: { customerName: args.customerName, orderId: shortId }
   });
   ```

---

## 📱 Meta WhatsApp Cloud API & Template Setup

WhatsApp notifications rely on approved pre-configured Meta utility templates. Create the following four templates in your **Meta Business Dashboard > WhatsApp > Message Templates** using **Utility** category and **English** language.

### 1. Order Confirmed (`order_confirmed`)
* **Trigger:** Success signature verification callback.
* **Header:** Dynamic Image
* **Body:**
  ```text
  Order Confirmed

  Dear {{1}}, your order #{{2}} has been placed successfully.

  Items: {{4}}
  Amount Paid: {{3}}

  Your order is being prepared for dispatch. You will receive shipping updates on this number.

  UpharVilla | upharvilla.in
  ```
* **Variables:** `{{1}}` Customer Name, `{{2}}` Order ID (last 8 chars), `{{3}}` Total Amount (e.g. Rs. 2,499), `{{4}}` Items summary list.

### 2. Order Shipped (`order_shipped`)
* **Trigger:** Admin updates order status to `"shipped"`.
* **Header:** Dynamic Image
* **Body:**
  ```text
  Order Shipped

  Dear {{1}}, your order #{{2}} has been shipped.

  Your package is on its way. You will be notified when it is out for delivery.

  UpharVilla | upharvilla.in
  ```
* **Variables:** `{{1}}` Customer Name, `{{2}}` Order ID.

### 3. Out for Delivery (`order_out_for_delivery`)
* **Trigger:** Admin updates status to `"out_for_delivery"`.
* **Header:** Dynamic Image
* **Body:**
  ```text
  Out for Delivery

  Dear {{1}}, your order #{{2}} is out for delivery.

  Our delivery partner will reach you shortly. Please keep your phone available for contact.

  UpharVilla | upharvilla.in
  ```
* **Variables:** `{{1}}` Customer Name, `{{2}}` Order ID.

### 4. Order Delivered (`order_delivered`)
* **Trigger:** Admin updates status to `"delivered"`.
* **Header:** Dynamic Image
* **Body:**
  ```text
  Order Delivered

  Dear {{1}}, your order #{{2}} has been delivered successfully.

  We hope you are satisfied with your purchase. You can review your order at {{3}}

  UpharVilla | upharvilla.in
  ```
* **Variables:** `{{1}}`  Customer Name, `{{2}}` Order ID, `{{3}}` Review link (`upharvilla.in/my-orders`).

---

## 🔒 Security

| Protection | Implementation |
|-----------|----------------|
| Price tampering | Server always recalculates from DB — client price never trusted |
| Payment replay | Idempotency check on `razorpayOrderId` before order creation |
| Cart swap | `expectedAmountPaise` stored at order creation, verified at completion |
| Webhook spoofing | HMAC-SHA256 constant-time signature verification |
| Review fraud | Verified-purchase + delivered-status + product-in-order checks |
| Admin mutations | All admin actions require `adminUsers` table lookup |
| Rate limiting | Max 5 checkout sessions per 10 min per user |
| Stock integrity | DB writes happen ONLY after amount verification passes |

---

## 🪝 Razorpay Webhook Setup

The webhook auto-recovers orders when the browser closes after payment but before the checkout callback fires (e.g. network drop, tab closed after paying).

1. Go to **Razorpay Dashboard → Settings → Webhooks → Add New Webhook**
2. **URL:** `https://<your-deployment>.convex.site/razorpay-webhook`
3. **Secret:** Any strong random string
4. **Events:** `payment.captured` (selecting all is fine — other events are silently ignored)
5. Add the same secret as `RAZORPAY_WEBHOOK_SECRET` in **Convex Dashboard → Environment Variables**

---

## ⏰ Scheduled Jobs

| Schedule | Job |
|----------|-----|
| Every 5 min | Process email queue |
| Every 5 min | Process WhatsApp queue |
| Daily 10:00 AM IST | Order packing reminders to admin |
| Daily 11:00 AM IST | Stale cart follow-up emails |
| Daily 12:00 PM IST | Post-delivery thank-you emails |
| Daily 1:00 PM IST | Review request emails |
| Daily 2:00 PM IST | Browse abandonment WhatsApp |
| Daily 11:30 AM IST | Cart abandonment WhatsApp |
| Daily 4:00 AM IST | Database garbage collection (expired sessions, stale reservations) |

