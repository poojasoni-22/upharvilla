"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProductCarouselSection from "./ProductCarouselSection";

const CustomGift = () => {
  const allProducts = useQuery(api.products.getByCategory, {
    category: "customized-gifts",
  });

  const products = allProducts?.slice(0, 15);

  return (
    <ProductCarouselSection
      products={products}
      title="Custom Gift"
      subtitle="Add a personal touch to your gift with our customization options, including photos, text, and gift hampers."
      viewAllLink="/products?category=customized-gifts"
      viewAllText="View All Collection"
      accentColorClass="bg-amber-500"
      accentTextClass="text-amber-600"
      sectionClassName="py-2 md:pb-8 md:pt-4 bg-transparent"
    />
  );
};

export default CustomGift;
