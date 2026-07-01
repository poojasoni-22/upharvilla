import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "upharVilla's return and refund policy — learn about our 48-hour replacement guarantee, refund process, and conditions for personalised gifts.",
};

export default function ReturnRefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-2xl md:text-4xl font-bold text-neutral-800 font-serif tracking-tight mb-8">
          Return &amp; Refund Policy
        </h1>

        <div className="prose prose-neutral prose-sm md:prose-base max-w-none space-y-6">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Our Promise
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              At upharVilla, we want you to be 100% satisfied with your
              purchase. If something isn&apos;t right, we&apos;re here to make
              it right.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Damaged or Defective Items
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              If you receive a damaged, broken, or defective item, please
              contact us within <strong>48 hours of delivery</strong> with
              photos of the product and packaging. We will arrange a{" "}
              <strong>free replacement or full refund</strong> at your choice.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Personalised &amp; Custom Items
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Custom and personalised items (engraved gifts, photo frames, name
              prints, etc.) are <strong>non-returnable</strong> unless they
              arrive damaged or with incorrect personalisation. If we made an
              error in your customisation, we will replace it free of charge.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Non-Returnable Items
            </h2>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Perishable items (chocolates, food hampers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Items with custom personalisation (unless defective)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Gift cards and vouchers</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              Refund Process
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Once we approve your return/refund request, the refund will be
              processed within <strong>5–7 business days</strong> to your
              original payment method. You will receive an email confirmation
              once the refund is initiated.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">
              How to Request a Return
            </h2>
            <ol className="space-y-2 text-neutral-600 list-decimal list-inside">
              <li>
                Email us at{" "}
                <a
                  href="mailto:support@upharvilla.in"
                  className="text-primary font-semibold hover:underline"
                >
                  support@upharvilla.in
                </a>{" "}
                with your order ID
              </li>
              <li>Attach clear photos of the issue</li>
              <li>Our team will respond within 24 hours</li>
              <li>
                We&apos;ll arrange pickup or provide return shipping
                instructions
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
