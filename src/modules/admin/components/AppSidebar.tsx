"use client";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Package2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const adminRoutes = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Content",
    url: "/admin/content-management",
    icon: Package2,
  },
  {
    title: "Enquiries",
    url: "/admin/enquiries",
    icon: MessageSquare,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    url: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Coupons & Offers",
    url: "/admin/coupons",
    icon: Ticket,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Auto-close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-4 px-3">
        <Link
          href="/admin"
          className="flex items-center justify-center w-full select-none"
        >
          {/* Collapsed icon state */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              UV
            </div>
          </div>
          {/* Expanded logo state */}
          <div className="flex group-data-[collapsible=icon]:hidden items-center justify-center h-10 overflow-hidden w-full">
            <Image
              src="/logo.png"
              alt="upharVilla Logo"
              width={993}
              height={294}
              sizes="150px"
              className="w-auto h-auto max-h-10 object-contain"
              priority
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-medium text-muted-foreground/70">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Access Control"
              isActive={pathname === "/admin/access-control"}
              className="hover:bg-sidebar-accent"
            >
              <Link
                href="/admin/access-control"
                className="flex items-center gap-2 w-full"
              >
                <ShieldCheck className="size-4" />
                <span>Access Control</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
