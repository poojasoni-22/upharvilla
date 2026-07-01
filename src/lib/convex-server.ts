import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Server-side Convex HTTP client for use in:
 * - generateMetadata() (product page meta tags)
 * - sitemap.ts (dynamic product URLs)
 * - Server Components
 *
 * This uses Convex's HTTP client which works without React hooks,
 * making it suitable for server-side rendering in Next.js.
 */
const getClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
  return new ConvexHttpClient(url);
};

/** Fetch a single product by its Convex ID */
export async function fetchProductById(id: string) {
  const client = getClient();
  try {
    return await client.query(api.products.getById, {
      id: id as Id<"products">,
    });
  } catch {
    return null;
  }
}

/** Fetch all active products (for sitemap generation) */
export async function fetchAllActiveProducts() {
  const client = getClient();
  try {
    const products = await client.query(api.products.list, {});
    return products.filter((p: any) => p.isActive);
  } catch {
    return [];
  }
}

/** Fetch reviews for a product (for AggregateRating schema) */
export async function fetchProductReviews(productId: string) {
  const client = getClient();
  try {
    return await client.query(api.reviews.listProductReviews, {
      productId: productId as Id<"products">,
    });
  } catch {
    return [];
  }
}
