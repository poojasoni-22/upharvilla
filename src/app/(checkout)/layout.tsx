import { Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#faf9ff] overflow-x-hidden font-sans">
      {/* Secure checkout header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-100 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Image
              src="/logo.png"
              alt="upharVilla"
              width={993}
              height={294}
              sizes="130px"
              className="w-[120px] sm:w-[130px] h-auto object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-semibold uppercase tracking-wider bg-neutral-50 border border-neutral-200/50 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Secure Checkout</span>
            </div>

            <Link
              href="/cart"
              className="w-10 h-10 rounded-full hover:bg-neutral-50 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-12">{children}</main>

      {/* Secure Checkout Footer */}
      <footer className="w-full bg-white border-t border-neutral-100 py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-light">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL Encryption · Guaranteed Safe Checkout</span>
          </div>

          <div className="text-[10px] text-neutral-400 font-light text-center sm:text-right">
            &copy; {new Date().getFullYear()} upharVilla. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
