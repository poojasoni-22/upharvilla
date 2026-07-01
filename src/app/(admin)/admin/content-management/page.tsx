"use client";

import { Package2 } from "lucide-react";
import { HeroBannerManager } from "@/modules/admin/components/content-management/HeroBannerManager";
import { OccasionManager } from "@/modules/admin/components/content-management/OccasionManager";

export default function ContentManagement() {
  return (
    <div className="space-y-4 px-1 sm:px-4 pb-6">
      <div className="flex items-start gap-2">
        <Package2 className="w-5 h-5 text-primary mt-1 shrink-0" />
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-800 font-serif">
            Content Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Customize your homepage visuals and editorial layouts.
          </p>
        </div>
      </div>

      {/* Hero Banners Section */}
      <section className="animate-in slide-in-from-bottom-2 duration-700 py-4 border-b border-neutral-200">
        <HeroBannerManager />
      </section>

      {/* Shop by Occasion Section */}
      <section className="animate-in slide-in-from-bottom-2 duration-700 py-4">
        <OccasionManager />
      </section>
    </div>
  );
}
