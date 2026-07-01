"use client";
import { useQuery } from "convex/react";
import { Package, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import NotFound from "@/app/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider, useAdmin } from "@/lib/admin-context";
import { AppSidebar } from "@/modules/admin/components/AppSidebar";
import { Dashboardcrumbs } from "@/modules/admin/components/Dashboardcrumbs";
import { api } from "../../../../convex/_generated/api";

function TotalProductsBadge() {
  const pathname = usePathname();
  const isInventory = pathname.includes("/admin/inventory");
  const count = useQuery(api.products.count);

  if (!isInventory || count === undefined) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15">
      <Package className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-semibold text-primary tabular-nums">
        {count}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium">
        products
      </span>
    </div>
  );
}

function TotalOrdersBadge() {
  const pathname = usePathname();
  const isOrders = pathname.includes("/admin/orders");
  const count = useQuery(api.orders.count);

  if (!isOrders || count === undefined) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15">
      <ShoppingBag className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-semibold text-primary tabular-nums">
        {count}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium">
        orders
      </span>
    </div>
  );
}

/** Access guard — Protects the /admin dashboard route */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAdmin();

  if (isLoading) {
    return null; // Return blank screen to hide the route's existence entirely while loading
  }

  if (role === null) {
    return <NotFound />;
  }

  return <>{children}</>;
}

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminGuard>
        <div className="h-screen overflow-hidden">
          <TooltipProvider delayDuration={0}>
            <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              <SidebarInset className="border-l h-screen flex flex-col">
                <header className="flex justify-between h-14 py-1 flex-none items-center border-b px-3 sm:px-4 lg:px-6 bg-sidebar/60 backdrop-blur-xl z-50">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 cursor-pointer hover:scale-105 transition-all duration-200" />
                    <Dashboardcrumbs />
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <TotalProductsBadge />
                    <TotalOrdersBadge />
                  </div>
                </header>
                <div className="flex-1 min-h-0">
                  <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6 xl:p-8">
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </div>
      </AdminGuard>
    </AdminProvider>
  );
}
