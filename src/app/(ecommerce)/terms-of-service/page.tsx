import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "upharVilla's terms of service — the terms and conditions governing your use of our website and purchase of gifts.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-2xl md:text-4xl font-bold text-neutral-800 font-serif tracking-tight mb-8">
          Terms of Service
        </h1>

        <p className="text-neutral-500 text-sm mb-8">Last updated: June 2026</p>

        <div className="prose prose-neutral prose-sm md:prose-base max-w-none space-y-6">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              By accessing and using upharVilla (upharvilla.in), you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Products &amp; Pricing
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              All product descriptions, images, and prices are presented as
              accurately as possible. However, we reserve the right to correct
              any errors and update pricing without prior notice. Prices are
              listed in Indian Rupees (₹) and include applicable taxes unless
              stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Orders &amp; Payment
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              By placing an order, you confirm that all information provided is
              accurate. We reserve the right to cancel or refuse any order for
              reasons including suspected fraud, unavailability of stock, or
              pricing errors. All payments are processed securely through
              Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Intellectual Property
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              All content on this website — including text, images, logos,
              graphics, and design — is the property of upharVilla and protected
              by copyright laws. You may not reproduce, distribute, or use any
              content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              upharVilla shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of our website or
              products. Our total liability is limited to the amount paid for
              the specific product in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Governing Law
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              These terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of the courts in Navsari,
              Gujarat.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Contact
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              For any questions regarding these terms, contact us at{" "}
              <a
                href="mailto:support@upharvilla.in"
                className="text-primary font-semibold hover:underline"
              >
                support@upharvilla.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
