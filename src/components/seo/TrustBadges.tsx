import { BadgeCheck, CreditCard, Gift, Truck } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Pan-India free shipping",
  },
  {
    icon: Gift,
    title: "Handcrafted Quality",
    description: "Every gift quality-checked",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "100% encrypted via Razorpay",
  },
  {
    icon: BadgeCheck,
    title: "Easy Returns",
    description: "48-hour replacement policy",
  },
];

/**
 * E-E-A-T Trust badges — visual trust signals for visitors and search engines.
 */
export function TrustBadges() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="flex flex-col items-center text-center p-3 sm:p-4 md:p-6 rounded-2xl group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-primary/15 transition-colors">
              <badge.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-neutral-800">
              {badge.title}
            </h3>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 mt-0.5">
              {badge.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
