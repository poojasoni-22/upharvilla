import { JsonLd } from "./JsonLd";

/**
 * HowTo JSON-LD — "How to Order Gifts on upharVilla"
 * Targets "how to" queries in Google AI Overviews and People Also Ask.
 */
export function HowToSchema() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Order Gifts on upharVilla",
    description:
      "A simple step-by-step guide to ordering personalised gifts, custom hampers, and corporate gifting from upharVilla — India's premier online gift shop.",
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: "299",
    },
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Browse our Collections",
        text: "Visit upharvilla.in and browse through our curated categories — Customized Gifts, Gift Hampers, Trending Gifts, Shop by Occasion, or Shop by Price. Use the search bar or filters to find the perfect gift.",
        url: "https://upharvilla.in/products",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose & Personalise Your Gift",
        text: "Select your gift and add any personalisation — custom names, messages, photos, or engravings. Preview your customisation before adding to cart.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Add to Cart & Checkout",
        text: "Add the gift to your cart, review your order, and proceed to checkout. Enter your shipping address and choose your preferred delivery date.",
        url: "https://upharvilla.in/cart",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Pay Securely",
        text: "Complete your purchase using any major payment method — UPI (Google Pay, PhonePe, Paytm), credit card, debit card, or net banking. All payments are processed securely via Razorpay.",
        url: "https://upharvilla.in/checkout",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Track & Receive Your Gift",
        text: "Receive order confirmation via email and SMS with tracking details. Track your order from your account dashboard. Your gift will be delivered in premium packaging within 3-7 business days.",
        url: "https://upharvilla.in/my-orders",
      },
    ],
  };

  return <JsonLd schema={howToSchema} />;
}
