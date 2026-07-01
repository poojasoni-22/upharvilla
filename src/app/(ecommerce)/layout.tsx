import type React from "react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { WishlistProvider } from "@/lib/wishlist-context";
import AnnouncementBar from "@/modules/user/components/AnnouncementBar";
import Footer from "@/modules/user/components/Footer";
import Header from "@/modules/user/components/Header";
import MobileBottomNav from "@/modules/user/components/MobileBottomNav";
import NavBar from "@/modules/user/components/NavBar";

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 z-50 w-full flex flex-col bg-white shadow-sm">
        <AnnouncementBar />
        <Header />
        {/* Category navigation bar — visible on all screens */}
        <NavBar />
      </div>
      {/* Breadcrumb structured data for inner pages */}
      <BreadcrumbSchema />
      <main className="flex-1 pb-16 md:pb-0">
        <WishlistProvider>{children}</WishlistProvider>
      </main>
      <Footer />
      {/* Mobile-only bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
