import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Learn about upharVilla's shipping policy — free delivery across India, estimated delivery times, and packaging standards for all gifts and hampers.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-2xl md:text-4xl font-bold text-neutral-800 font-serif tracking-tight mb-8">
          Shipping Policy
        </h1>

        <div className="prose prose-neutral prose-sm md:prose-base max-w-none space-y-6">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Delivery Coverage
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              upharVilla delivers across India. We ship to all major cities,
              towns, and most pin codes serviced by our courier partners.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Estimated Delivery Time
            </h2>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Metro Cities</strong> (Mumbai, Delhi, Bangalore,
                  Chennai, Kolkata, Hyderabad): 3–5 business days
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Other Cities &amp; Towns</strong>: 5–7 business days
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Remote Areas</strong>: 7–10 business days
                </span>
              </li>
            </ul>
            <p className="text-neutral-500 text-sm mt-3">
              Delivery times may vary during peak seasons, festivals, and
              unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Shipping Charges
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              We offer <strong>free shipping</strong> on most orders across
              India. For select remote locations, a nominal delivery charge may
              apply and will be shown at checkout before payment.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Packaging
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              All gifts are carefully packed with premium packaging to ensure
              they arrive in perfect condition. Fragile items receive additional
              protective packaging. Gift-ready packaging is included at no extra
              charge.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Order Tracking
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Once your order is dispatched, you will receive a tracking ID via
              email and SMS. You can track your order status anytime from your
              account dashboard under &quot;My Orders&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Contact Us
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              For any shipping-related queries, reach out to us at{" "}
              <a
                href="mailto:support@upharvilla.in"
                className="text-primary font-semibold hover:underline"
              >
                support@upharvilla.in
              </a>{" "}
              or call{" "}
              <a
                href="tel:+918160572007"
                className="text-primary font-semibold hover:underline"
              >
                +91 81605 72007
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
