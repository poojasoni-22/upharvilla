"use client";

import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import ProductCarouselSection from "./ProductCarouselSection";

const NewArrival = () => {
  const products = useQuery(api.products.getNewArrivals, { limit: 15 });

  return (
    <ProductCarouselSection
      products={products}
      title="New Arrival"
      subtitle="Explore our latest drops and trending pieces designed to elevate your style."
      viewAllLink="/products?flag=new-arrival"
      viewAllText="View All New Arrivals"
      accentColorClass="bg-primary"
      accentTextClass="text-primary"
      sectionClassName="py-4 md:py-6 lg:py-8 bg-background overflow-hidden"
      decorations={
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        </>
      }
      footerExtra={
        <div className="flex justify-center mt-2 md:mt-2">
          <div className="flex items-center gap-1.5 md:gap-2 border border-purple-100 bg-purple-50/30 rounded-md px-3 md:px-4 py-1.5 md:py-2 shadow-sm">
            <Star className="fill-purple-600 text-purple-600 w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-sm font-medium text-gray-600">
              Rated 4.8 / 5 | Trusted by 4,62,543 Happy Customers
            </span>
          </div>
        </div>
      }
    />
  );
};

export default NewArrival;
