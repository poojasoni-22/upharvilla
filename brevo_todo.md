# Brevo Deliverability & Configuration Checklist

To ensure your emails are delivered directly to your customers' inboxes (and not marked as spam by Gmail/Yahoo), you need to configure your domain settings and API credentials in Brevo. Follow these steps:

---

## 1. Domain Authentication (DNS Setup)

To authorize Brevo to send emails on behalf of `upharvilla.in`, log into your DNS registrar (e.g., GoDaddy, Cloudflare, Namecheap) and add the following records:

### A. DKIM (DomainKeys Identified Mail)
* **Type**: `TXT`
* **Host/Name**: `mail._domainkey` (or the exact value provided by Brevo)
* **Value**: *[Copy the DKIM key generated in your Brevo dashboard under Senders & IP > Domains]*

### B. SPF (Sender Policy Framework)
* **Type**: `TXT`
* **Host/Name**: `@` (or leave empty/root)
* **Value**: `v=spf1 include:spf.sendinblue.com ~all`
*(Note: If you already have an SPF record for another service like Google Workspace, merge them, e.g., `v=spf1 include:_spf.google.com include:spf.sendinblue.com ~all`)*

### C. DMARC (Domain-based Message Authentication)
* **Type**: `TXT`
* **Host/Name**: `_dmarc` (or `_dmarc.upharvilla.in`)
* **Value**: `v=DMARC1; p=none; rua=mailto:dmarc-reports@upharvilla.in`
*(Note: Replace the mailto address with your admin email or remove the `rua` directive if you do not want to receive reports)*

---

## 2. Authorize Sender Emails in Brevo

Go to **Senders & IP > Senders** in your Brevo dashboard and verify the following email addresses (requires clicking a verification link in the inbox):
1. [ ] `hello@upharvilla.in` (Primary brand sender)
2. [ ] `orders@upharvilla.in` (Used for order notifications and confirmations)
3. [ ] `support@upharvilla.in` (Used for customer enquiries and help desk support)

---

## 3. Convex Environment Variables

Log into your **Convex Dashboard** and add/update the following environment variables. The template ID variables are optional; if left empty, the system automatically falls back to beautiful HTML-in-code layouts:

| Variable Name | Description / Example Value |
| :--- | :--- |
| `BREVO_API_KEY` | Your Brevo SMTP API Key (starts with `xkeysib-`) |
| `BREVO_SENDER_EMAIL` | `hello@upharvilla.in` |
| `BREVO_SENDER_NAME` | `UpharVilla` |
| `SITE_URL` | `https://upharvilla.in` (links back to your store) |
| `BREVO_TEMPLATE_ORDER_CONFIRMATION` | Template ID for customer order confirmation (e.g. `1`) |
| `BREVO_TEMPLATE_ORDER_STATUS_UPDATE` | Template ID for customer shipped/out-for-delivery/delivered updates (e.g. `2`) |
| `BREVO_TEMPLATE_ADMIN_ORDER_ALERT` | Template ID for admin new order alerts (e.g. `3`) |
| `BREVO_TEMPLATE_ADMIN_ENQUIRY_ALERT` | Template ID for admin contact form alert (e.g. `4`) |
| `BREVO_TEMPLATE_ENQUIRY_AUTOREPLY` | Template ID for customer contact auto-replies (e.g. `5`) |
| `BREVO_TEMPLATE_ORDER_REMINDER` | Template ID for order packing alerts (e.g. `6`) |
| `BREVO_TEMPLATE_RESTOCK_NOTIFICATION` | Template ID for product restock notification (e.g. `7`) |
| `BREVO_TEMPLATE_CART_FOLLOWUP` | Template ID for abandoned cart follow-up emails (e.g. `8`) |
| `BREVO_TEMPLATE_THANK_YOU` | Template ID for post-delivery appreciation (e.g. `9`) |
| `BREVO_TEMPLATE_REVIEW_REQUEST` | Template ID for customer rating feedback request (e.g. `10`) |

---

## 4. (Optional) Migrate to Hosted Templates

Currently, your Convex code generates beautiful HTML emails dynamically and uploads them to Brevo. If you wish to migrate to Brevo-hosted templates in the future to save bandwidth and edit email styles without code changes:
1. Create a template in **Transactional > Templates** on Brevo (e.g., Order Confirmation template).
2. Note the **Template ID** (e.g., `12`).
3. Replace the `htmlContent` parameter in the enqueuing calls with a template payload:
   ```typescript
   // Example payload structure for future templates:
   await ctx.runMutation(internal.emails.queue.enqueue, {
     to: [{ email: args.customerEmail, name: args.customerName }],
     subject: `Order Confirmed: #${shortId}`,
    // Instead of htmlContent, we would pass templateId and variables:
     templateId: 12,
     params: { customerName: args.customerName, orderId: shortId }
   });
   ```

---

## 5. Transactional Email Templates List

If you decide to migrate to Brevo-hosted templates, you should create the following **10 email templates** in your Brevo dashboard:

### Customer-Facing Emails

1. **Order Confirmation**
   * **Subject**: `Order Confirmed: #{{params.orderId}}`
   * **Purpose**: Sent immediately upon successful Razorpay payment.
   
2. **Order Shipped Update**
   * **Subject**: `Order Shipped: #{{params.orderId}}`
   * **Purpose**: Sent when the order status is updated to "shipped".

3. **Order Out for Delivery Update**
   * **Subject**: `Order Out for Delivery: #{{params.orderId}}`
   * **Purpose**: Sent when order status is "out_for_delivery".

4. **Order Delivered Update**
   * **Subject**: `Order Delivered: #{{params.orderId}}`
   * **Purpose**: Sent when order status is "delivered". Includes product rating links.

5. **Enquiry Auto-Reply**
   * **Subject**: `We got your message, {{params.firstName}}! — UpharVilla`
   * **Purpose**: Automated response confirming contact form submission.

6. **Order Packing Reminder**
   * **Subject**: `📦 Your order #{{params.orderId}} is being packed — UpharVilla`
   * **Purpose**: Informs customers their order is actively being prepared.

7. **Product Restock Notification**
   * **Subject**: `Back in stock: {{params.productName}} is available! — UpharVilla`
   * **Purpose**: Sent to user waiting lists when products are restocked.

8. **Cart Follow-up (Abandoned Cart)**
   * **Subject**: `🛒 {{params.firstName}}, your cart is waiting — UpharVilla`
   * **Purpose**: Sent to users who left items in their cart for more than 24 hours.

9. **Delivery Confirmation / Thank You**
   * **Subject**: `Order Delivered: #{{params.orderId}}`
   * **Purpose**: Sent to thank the customer and promote new arrivals.

10. **Review Request**
    * **Subject**: `⭐ How was your UpharVilla gift, {{params.firstName}}?`
    * **Purpose**: Sent a few days after delivery to request rating feedback.

### Admin-Facing Notifications

11. **Admin: New Order Alert**
    * **Subject**: `🛒 New Order #{{params.orderId}} — ₹{{params.totalAmount}} from {{params.customerName}}`
    * **Purpose**: Sent to `hello@upharvilla.in` to notify admin of a new order to fulfill.

12. **Admin: New Enquiry Alert**
    * **Subject**: `📩 New Enquiry from {{params.name}}`
    * **Purpose**: Sent to `hello@upharvilla.in` with contact message details.

