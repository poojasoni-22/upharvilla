import type { MetadataRoute } from "next";
import { fetchAllActiveProducts } from "@/lib/convex-server";

/** Revalidate sitemap every hour so new products appear without redeploy */
export const revalidate = 3600;

/**
 * Dynamic sitemap that includes:
 * 1. Static pages (homepage, products, contact, policies)
 * 2. All active products from the database (auto-updated)
 *
 * Every time a product is added/activated, it appears in the sitemap
 * automatically — no manual work needed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://upharvilla.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/return-refund`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic product pages — fetched from Convex
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchAllActiveProducts();
    productPages = products.map((product: any) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: new Date(product.launchedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // Silently fail — sitemap still works with static pages
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...staticPages, ...productPages];
}
