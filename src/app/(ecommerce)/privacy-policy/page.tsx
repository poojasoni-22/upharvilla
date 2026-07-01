import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "upharVilla's privacy policy — how we collect, use, and protect your personal information when you shop with us.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-2xl md:text-4xl font-bold text-neutral-800 font-serif tracking-tight mb-8">
          Privacy Policy
        </h1>

        <p className="text-neutral-500 text-sm mb-8">Last updated: June 2026</p>

        <div className="prose prose-neutral prose-sm md:prose-base max-w-none space-y-6">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Information We Collect
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              When you place an order or create an account on upharVilla, we
              collect your name, email address, phone number, shipping address,
              and payment information. We also collect browsing data and cookies
              to improve your shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              How We Use Your Information
            </h2>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Processing and fulfilling your orders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Sending order confirmations and shipping updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Providing customer support and responding to enquiries
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Improving our website, products, and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Sending promotional emails (only with your consent)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Payment Security
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              All payments are processed securely through Razorpay. We do not
              store your credit card or bank details on our servers. All
              transactions are encrypted with industry-standard SSL/TLS
              encryption.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Data Sharing
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              We do not sell, trade, or share your personal information with
              third parties, except as necessary to fulfil your orders (e.g.,
              sharing your shipping address with our courier partners).
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Your Rights
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              You may request access to, correction of, or deletion of your
              personal data at any time by contacting us at{" "}
              <a
                href="mailto:support@upharvilla.in"
                className="text-primary font-semibold hover:underline"
              >
                support@upharvilla.in
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Contact
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              For privacy-related concerns, email us at{" "}
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
