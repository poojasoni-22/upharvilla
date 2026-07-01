"use client";

import { useMutation, useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { use, useEffect } from "react";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { authClient } from "@/lib/auth-client";
import { CustomerReviews } from "@/modules/user/product/CustomerReviews";
import { ProductDetails } from "@/modules/user/product/ProductDetails";
import { SimilarProducts } from "@/modules/user/product/SimilarProducts";
import { YouMayAlsoLike } from "@/modules/user/product/YouMayAlsoLike";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { RecentlyViewed } from "../../../../modules/user/product/RecentlyViewed";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Extract id from params
  const { id } = use(params);
  const { data: session } = authClient.useSession();
  const recordView = useMutation(api.recentlyViewed.recordView);

  // Fetch product from convex
  const product = useQuery(api.products.getById, { id: id as Id<"products"> });

  // Record product view on mount (only for logged-in users)
  useEffect(() => {
    if (product && session) {
      recordView({ productId: product._id });
    }
  }, [product, session, recordView]);

  return (
    <div className="min-h-screen bg-white pb-6 md:pb-8">
      {/* Product Content */}
      {product === undefined ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : product === null || (!product.isActive && !session) ? (
        notFound()
      ) : (
        <>
          {/* Dynamic Product JSON-LD + Review Schema + LLM Context */}
          <ProductSchema product={product} />
          <ProductDetails product={product} />
          <CustomerReviews productId={product._id} />
          <SimilarProducts
            category={product.category}
            currentProductId={product._id}
          />
          <RecentlyViewed currentProductId={product._id} />
          <YouMayAlsoLike currentProductId={product._id} />
        </>
      )}
    </div>
  );
}
