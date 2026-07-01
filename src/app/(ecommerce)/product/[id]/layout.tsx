import type { Metadata } from "next";
import { fetchProductById } from "@/lib/convex-server";

const BASE_URL = "https://upharvilla.in";

/**
 * Dynamic metadata for each product page.
 * Fetches product data server-side and generates:
 * - Page title with product name
 * - Description from product description
 * - OG image from product thumbnail
 * - Canonical URL
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await fetchProductById(id);

    if (!product) {
      return {
        title: "Product Not Found",
        description: "This product could not be found on upharVilla.",
      };
    }

    const discountedPrice = product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

    const description =
      product.description.length > 160
        ? `${product.description.slice(0, 157)}...`
        : product.description;

    const title = product.name;
    const url = `${BASE_URL}/product/${product._id}`;

    return {
      title,
      description: `${description} — ₹${discountedPrice}. Free delivery across India. Shop at upharVilla.`,
      openGraph: {
        title: `${product.name} | upharVilla`,
        description,
        url,
        type: "website",
        images: product.thumbnail
          ? [
              {
                url: product.thumbnail,
                width: 800,
                height: 800,
                alt: product.name,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | upharVilla`,
        description,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return {
      title: "Product",
      description: "Shop thoughtful gifts at upharVilla.",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
