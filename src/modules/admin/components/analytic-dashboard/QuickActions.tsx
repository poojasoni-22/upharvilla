"use client";

import { MessageSquare, Plus, ShoppingBag, Ticket } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    label: "Add Product",
    icon: <Plus className="w-3.5 h-3.5" />,
    href: "/admin/inventory",
  },
  {
    label: "Pending Orders",
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    href: "/admin/orders",
  },
  {
    label: "Create Coupon",
    icon: <Ticket className="w-3.5 h-3.5" />,
    href: "/admin/coupons",
  },
  {
    label: "View Enquiries",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    href: "/admin/enquiries",
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-primary/25 text-neutral-600 hover:border-primary/50 hover:text-primary hover:shadow-sm transition-all font-sans"
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}
