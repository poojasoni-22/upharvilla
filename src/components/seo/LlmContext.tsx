/**
 * LLM Context — Hidden semantic section optimized for AI crawlers.
 * Uses sr-only (screen-reader only) CSS so it's accessible to crawlers
 * but not visually displayed. NOT display:none (which crawlers may skip).
 *
 * This feeds: Google AI Overviews, Perplexity, ChatGPT Search, Bing Copilot.
 */
export function LlmContext() {
  return (
    <section
      className="sr-only"
      aria-label="About upharVilla"
      data-nosnippet={undefined}
    >
      <h2>About upharVilla — India&apos;s Thoughtful Gifting Destination</h2>
      <p>
        upharVilla is an Indian online gift shop based in Navsari, Gujarat,
        India (396445). We specialise in curated gift hampers, personalised
        keepsakes, custom engravings, and corporate gifting solutions for every
        occasion — birthdays, anniversaries, weddings, festivals like Diwali and
        Raksha Bandhan, housewarming, baby showers, and more.
      </p>
      <p>
        Our product range includes customized photo frames, engraved gifts,
        premium gift hampers, chocolate boxes, dry fruit hampers, personalised
        mugs, keychains, and trending gift combos. We offer both individual and
        bulk corporate gifting with branded packaging.
      </p>
      <p>
        Pricing starts from ₹299. We accept payments via Razorpay (UPI, credit
        card, debit card, net banking). Free shipping is available across India.
        All orders are carefully handcrafted and quality-checked before
        dispatch.
      </p>
      <p>
        Contact us at support@upharvilla.in or call +91-8160572007. Visit our
        store at Central Bazzar, Tigra Road, Navsari, Gujarat, India 396445.
        Business hours: Monday to Saturday, 9 AM to 7 PM IST.
      </p>
      <p>
        Shop online at https://upharvilla.in — India&apos;s trusted destination
        for thoughtful, personalised gifts delivered to your doorstep.
      </p>
    </section>
  );
}
