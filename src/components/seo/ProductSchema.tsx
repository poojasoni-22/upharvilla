"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { JsonLd } from "./JsonLd";

const BASE_URL = "https://upharvilla.in";

interface ProductSchemaProps {
  product: {
    _id: Id<"products">;
    name: string;
    slug: string;
    description: string;
    price: number;
    discount?: number;
    images?: string[];
    thumbnail?: string;
    category: string;
    tags: string[];
    stock: number;
    isActive: boolean;
  };
}

/**
 * Dynamic Product JSON-LD schema — renders on every product page.
 * Includes Product + Offer + AggregateRating (from real reviews).
 * This is what makes each product visible to Google, ChatGPT, Perplexity, etc.
 */
export function ProductSchema({ product }: ProductSchemaProps) {
  // Fetch real reviews for this product
  const reviews = useQuery(api.reviews.listProductReviews, {
    productId: product._id,
  });

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const productUrl = `${BASE_URL}/product/${product._id}`;
  const productImages = product.images?.length
    ? product.images
    : product.thumbnail
      ? [product.thumbnail]
      : [];

  // Calculate aggregate rating from real reviews
  const reviewList = reviews || [];
  const reviewCount = reviewList.length;
  const avgRating =
    reviewCount > 0
      ? Math.round(
          (reviewList.reduce((sum: number, r: any) => sum + r.rating, 0) /
            reviewCount) *
            10,
        ) / 10
      : undefined;

  // Build the Product schema
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "upharVilla",
    },
    category: formatCategory(product.category),
    sku: product._id,
    image: productImages,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: discountedPrice,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "upharVilla",
      },
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "INR",
        },
      },
    },
  };

  // Add AggregateRating if reviews exist
  if (avgRating && reviewCount > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };

    // Add up to 10 individual reviews
    productSchema.review = reviewList.slice(0, 10).map((r: any) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.userName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.reviewText,
      datePublished: new Date(r.createdAt).toISOString().split("T")[0],
    }));
  }

  return (
    <>
      <JsonLd schema={productSchema} />
      {/* Product-level LLM context — hidden semantic content for AI crawlers */}
      <div className="sr-only llm-context" data-speakable="true">
        <p>
          {product.name} is available at upharVilla for ₹{discountedPrice}.{" "}
          {product.discount
            ? `Original price ₹${product.price}, ${product.discount}% off. `
            : ""}
          {product.stock > 0
            ? `In stock — order now for free delivery across India.`
            : `Currently out of stock — notify me when available.`}{" "}
          {product.description}
          {avgRating
            ? ` Rated ${avgRating}/5 by ${reviewCount} customers.`
            : ""}{" "}
          Shop at upharvilla.in or contact support@upharvilla.in.
        </p>
      </div>
    </>
  );
}

/** Format category slug to human-readable */
function formatCategory(category: string): string {
  const map: Record<string, string> = {
    "customized-gifts": "Customised Gifts",
    "corporate-gifts": "Corporate Gifts",
    hampers: "Gift Hampers",
    "frames-bouquet": "Frames & Bouquets",
    "shop-by-occasion": "Occasion Gifts",
    "new-arrivals": "New Arrivals",
  };
  return map[category] || category;
}
