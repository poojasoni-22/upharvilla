"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { JsonLd } from "./JsonLd";

const faqData = [
  {
    question: "What types of gifts does upharVilla offer?",
    answer:
      "upharVilla offers a wide range of curated gifts including personalised keepsakes, custom engravings, premium gift hampers, chocolate boxes, dry fruit hampers, photo frames, mugs, keychains, and corporate gifting solutions. We specialise in customised gifts for birthdays, anniversaries, weddings, Diwali, Raksha Bandhan, and every special occasion.",
  },
  {
    question: "Does upharVilla deliver across India?",
    answer:
      "Yes! upharVilla delivers across India with free shipping on most orders. We carefully handcraft and quality-check every gift before dispatch to ensure it arrives in perfect condition at your doorstep.",
  },
  {
    question: "Can I customise or personalise a gift?",
    answer:
      "Absolutely! Personalisation is our speciality. You can add custom names, messages, photos, and engravings to many of our products. Browse our 'Customized Gifts' category to explore all personalisation options.",
  },
  {
    question: "What payment methods does upharVilla accept?",
    answer:
      "We accept all major payment methods through Razorpay including UPI (Google Pay, PhonePe, Paytm), credit cards, debit cards, and net banking. All transactions are 100% secure and encrypted.",
  },
  {
    question: "Does upharVilla offer corporate or bulk gifting?",
    answer:
      "Yes, we provide corporate gifting solutions with branded packaging for companies, events, and festivals. Whether you need 10 or 1,000 gifts, we can customise hampers with your company branding. Contact us at support@upharvilla.in for bulk orders.",
  },
  {
    question: "What is the return and refund policy?",
    answer:
      "We want you to be 100% satisfied with your purchase. If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos, and we will arrange a replacement or full refund. Custom and personalised items are non-returnable unless defective.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 5-7 business days across India. For metro cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad), delivery typically takes 3-5 business days. You will receive tracking details via email and SMS once your order is dispatched.",
  },
  {
    question: "How do I contact upharVilla for support?",
    answer:
      "You can reach us via email at support@upharvilla.in or call us at +91-8160572007 (Mon-Sat, 9 AM - 7 PM IST). You can also visit our store at Central Bazzar, Tigra Road, Navsari, Gujarat, India 396445. We typically respond within 24 hours.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
    >
      <JsonLd schema={faqSchema} />

      <div className="text-center space-y-1.5 sm:space-y-2 mb-6 md:mb-12">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
          Got Questions?
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-800 font-serif tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Everything you need to know about ordering, customisation, delivery,
          and more at upharVilla.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="border border-neutral-100 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-sm transition-shadow duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 md:px-6 md:py-5 text-left cursor-pointer group"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm md:text-base font-semibold text-neutral-800 pr-3 sm:pr-4 group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-4 pb-3.5 sm:px-5 sm:pb-4 md:px-6 md:pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
