# WhatsApp Notification Messages — Preview

![WhatsApp Demo Messages](C:\Users\Ritesh Sinha\.gemini\antigravity-ide\brain\9fd95086-31fb-4ed6-bdca-0b75217c350c\whatsapp_clean_messages_1782247076623.png)

---

## Message Templates — Exact Content

Each message has a **product image header** (first item's thumbnail) + professional body text. No emojis.

---

### 1. Order Confirmed (`order_confirmed`)
> **Trigger**: Immediately after successful payment

```
[Product Image Header]

Order Confirmed

Dear {{1}}, your order #{{2}} has been placed successfully.

Items: {{4}}
Amount Paid: {{3}}

Your order is being prepared for dispatch. You will receive shipping updates on this number.

UpharVilla | upharvilla.in
```

| Variable | Value |
|:--|:--|
| `{{1}}` | Customer name |
| `{{2}}` | Order ID (last 8 chars) |
| `{{3}}` | Total amount (e.g. Rs. 2,499) |
| `{{4}}` | Items summary (e.g. "1x Gift Hamper, 1x Photo Frame") |

---

### 2. Order Shipped (`order_shipped`)
> **Trigger**: Admin updates status to "Shipped"

```
[Product Image Header]

Order Shipped

Dear {{1}}, your order #{{2}} has been shipped.

Your package is on its way. You will be notified when it is out for delivery.

UpharVilla | upharvilla.in
```

| Variable | Value |
|:--|:--|
| `{{1}}` | Customer name |
| `{{2}}` | Order ID |

---

### 3. Out for Delivery (`order_out_for_delivery`)
> **Trigger**: Admin updates status to "Out for Delivery"

```
[Product Image Header]

Out for Delivery

Dear {{1}}, your order #{{2}} is out for delivery.

Our delivery partner will reach you shortly. Please keep your phone available for contact.

UpharVilla | upharvilla.in
```

| Variable | Value |
|:--|:--|
| `{{1}}` | Customer name |
| `{{2}}` | Order ID |

---

### 4. Order Delivered (`order_delivered`)
> **Trigger**: Admin updates status to "Delivered"

```
[Product Image Header]

Order Delivered

Dear {{1}}, your order #{{2}} has been delivered successfully.

We hope you are satisfied with your purchase. You can review your order at {{3}}

UpharVilla | upharvilla.in
```

| Variable | Value |
|:--|:--|
| `{{1}}` | Customer name |
| `{{2}}` | Order ID |
| `{{3}}` | Review link (upharvilla.in/my-orders) |

---

## Meta Business Dashboard Setup

> [!IMPORTANT]
> Create these 4 templates in **Meta Business Dashboard** > WhatsApp > Message Templates

| Template Name | Category | Header | Language |
|:--|:--|:--|:--|
| `order_confirmed` | Utility | Image (dynamic) | English |
| `order_shipped` | Utility | Image (dynamic) | English |
| `order_out_for_delivery` | Utility | Image (dynamic) | English |
| `order_delivered` | Utility | Image (dynamic) | English |

Template approval takes 24-48 hours from Meta.
