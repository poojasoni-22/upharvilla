"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NewsletterBox from "./NewsletterBox";

// Compile-safe inline SVG icons matching Lucide styling
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="w-full bg-white pt-8 md:pt-20 pb-28 md:pb-0">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
        {/* Newsletter Section */}
        <NewsletterBox />

        {/* Footer Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16 xl:gap-20 pb-8 md:pb-16 border-b border-neutral-100">
          {/* Brand Column — full width on mobile */}
          <div className="col-span-2 md:col-span-1 space-y-4 md:space-y-6">
            <Image
              src="/logo.png"
              alt="upharVilla"
              width={993}
              height={294}
              sizes="150px"
              className="w-[120px] md:w-[150px] h-auto object-contain"
            />
            <p className="text-muted-foreground text-xs md:text-sm lg:text-base leading-relaxed max-w-xs font-medium">
              Making every occasion special with curated hampers and
              personalized gifts. Your one-stop shop for thoughtful gifting.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                {
                  icon: InstagramIcon,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
                {
                  icon: FacebookIcon,
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  icon: YoutubeIcon,
                  href: "https://youtube.com",
                  label: "Youtube",
                },
                {
                  icon: MessageCircle,
                  href: "https://wa.me/919876543210",
                  label: "WhatsApp",
                },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100/80 flex items-center justify-center text-neutral-500 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-bold text-gray-900 text-sm md:text-lg lg:text-xl tracking-tight">
              Shop Categories
            </h3>
            <ul className="space-y-2 md:space-y-3.5">
              {[
                {
                  name: "Custom Hampers",
                  path: "/products?tag=Customized Hampers",
                },
                {
                  name: "Frames & Bouquets",
                  path: "/products?tag=Customized Photo Gifts",
                },
                {
                  name: "Anniversary Gifts",
                  path: "/products?tag=Anniversary",
                },
                {
                  name: "Corporate Gifting",
                  path: "/products?tag=Employee Welcome Kits",
                },
                { name: "New Arrivals", path: "/new-arrivals" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm font-medium hover:underline decoration-primary/30 underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-bold text-gray-900 text-sm md:text-lg lg:text-xl tracking-tight">
              Customer Care
            </h3>
            <ul className="space-y-2 md:space-y-3.5">
              {[
                { name: "About Us", path: "/about" },
                { name: "Contact Us", path: "/contact" },
                { name: "Shipping Policy", path: "/shipping-policy" },
                { name: "Track Order", path: "/my-orders" },
                { name: "Return & Refund", path: "/return-refund" },
                { name: "FAQs", path: "/#faq" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm font-medium hover:underline decoration-primary/30 underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info — full width on mobile for symmetry */}
          <div className="col-span-2 md:col-span-1 space-y-4 md:space-y-6">
            <h3 className="font-bold text-gray-900 text-sm md:text-lg lg:text-xl tracking-tight">
              Get in Touch
            </h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-3 text-xs md:text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="leading-relaxed font-medium">
                  Central Bazzar, Tigra Road,
                  <br />
                  Navsari, Gujarat, India 396445
                </span>
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium hover:text-primary transition-colors cursor-pointer">
                  +91 81605 72007
                </span>
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-medium hover:text-primary transition-colors cursor-pointer">
                  support@upharvilla.in
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground font-semibold">
          <p>© 2026 upharVilla. All rights reserved.</p>
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-all hover:underline underline-offset-4 decoration-primary/20"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-primary transition-all hover:underline underline-offset-4 decoration-primary/20"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
