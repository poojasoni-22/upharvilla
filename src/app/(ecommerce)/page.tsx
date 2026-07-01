import dynamic from "next/dynamic";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { LlmContext } from "@/components/seo/LlmContext";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { SpeakableSchema } from "@/components/seo/SpeakableSchema";
import { TrustBadges } from "@/components/seo/TrustBadges";
import Categories from "@/modules/user/components/Categories";
import Features from "@/modules/user/components/Features";
import HeroSlider from "@/modules/user/components/HeroSlider";
import RelationshipSelector from "@/modules/user/components/RelationshipSelector";

// Lazy-load below-the-fold sections — they won't block the initial page render
const NewArrival = dynamic(
  () => import("@/modules/user/components/NewArrival"),
);
const EditorialSlider = dynamic(
  () => import("@/modules/user/components/EditorialSlider"),
);
const Trending = dynamic(() => import("@/modules/user/components/Trending"));
const ShopByPrice = dynamic(
  () => import("@/modules/user/components/ShopByPrice"),
);
const CustomGift = dynamic(
  () => import("@/modules/user/components/CustomGift"),
);
const ShopByOccasion = dynamic(
  () => import("@/modules/user/components/ShopByOccasion"),
);
const Testimonials = dynamic(
  () => import("@/modules/user/components/Testimonials"),
);
const FAQSection = dynamic(() =>
  import("@/components/seo/FAQSection").then((mod) => ({
    default: mod.FAQSection,
  })),
);

const HomePage = () => {
  return (
    <div className="mt-2 md:mt-6 lg:mt-8">
      {/* Structured Data — Organization + WebSite + OnlineStore */}
      <OrganizationSchema />
      {/* Speakable — voice/AI engine targeting */}
      <SpeakableSchema />
      {/* HowTo — "How to order gifts" schema */}
      <HowToSchema />
      {/* LLM/GEO Context — hidden semantic content for AI crawlers */}
      <LlmContext />

      <div className="space-y-5 md:space-y-6 lg:space-y-8 xl:space-y-10">
        <HeroSlider />
        <Categories />
        <RelationshipSelector />
        <Features />
        <NewArrival />
        <EditorialSlider />
        <Trending />
        <ShopByPrice />
        <CustomGift />
        <ShopByOccasion />
        <Testimonials />
        <FAQSection />
        <TrustBadges />
      </div>
    </div>
  );
};

export default HomePage;
