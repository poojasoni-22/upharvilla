"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProductCarouselSection from "./ProductCarouselSection";

const Trending = () => {
  const products = useQuery(api.products.getTrending, { limit: 15 });

  return (
    <ProductCarouselSection
      products={products}
      title="Trending"
      subtitle="Discover the most loved pieces that are currently capturing everyone's attention."
      viewAllLink="/products?flag=trending"
      viewAllText="View All Trending"
      accentColorClass="bg-[#FC2779]"
      accentTextClass="text-[#FC2779]"
      sectionClassName="py-2 md:py-6 lg:py-8 bg-white overflow-hidden"
      decorations={null}
    />
  );
};

export default Trending;
