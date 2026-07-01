"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "./JsonLd";

/**
 * Auto-generates BreadcrumbList JSON-LD from the current URL path.
 * Place this in the ecommerce layout for automatic breadcrumbs on all pages.
 */
export function BreadcrumbSchema() {
  const pathname = usePathname();

  // Build breadcrumb items from URL segments
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Home",
      item: "https://upharvilla.in",
    },
    ...segments.map((segment, index) => ({
      "@type": "ListItem" as const,
      position: index + 2,
      name: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      item: `https://upharvilla.in/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];

  // Don't render for homepage (just "Home" alone is not useful)
  if (segments.length === 0) return null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return <JsonLd schema={breadcrumbSchema} />;
}
