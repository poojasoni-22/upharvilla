"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Dashboardcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path !== "");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/admin"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          if (path === "admin") return null;
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const title =
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator className="[&>svg]:size-3" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={href}
                      className="transition-colors hover:text-foreground"
                    >
                      {title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
