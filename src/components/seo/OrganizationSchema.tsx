import { JsonLd } from "./JsonLd";

/**
 * Injects Organization + WebSite + SearchAction JSON-LD schemas.
 * Place this once in the ecommerce layout or homepage.
 */
export function OrganizationSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "upharVilla",
    url: "https://upharvilla.in",
    logo: "https://upharvilla.in/logo.png",
    description:
      "India's premier online gift shop offering curated hampers, personalised keepsakes, custom engravings, and corporate gifting solutions for every occasion.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-8160572007",
      contactType: "customer service",
      email: "support@upharvilla.in",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Central Bazzar, Tigra Road",
      addressLocality: "Navsari",
      addressRegion: "Gujarat",
      postalCode: "396445",
      addressCountry: "IN",
    },
    sameAs: [
      // TODO: Add real social media URLs when available
      // "https://instagram.com/upharvilla",
      // "https://facebook.com/upharvilla",
      // "https://youtube.com/@upharvilla",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "upharVilla",
    url: "https://upharvilla.in",
    description:
      "Shop curated gifts, custom hampers, personalised keepsakes & corporate gifting at upharVilla — India's thoughtful gifting destination.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://upharvilla.in/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "upharVilla",
      url: "https://upharvilla.in",
    },
  };

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "upharVilla",
    url: "https://upharvilla.in",
    description:
      "upharVilla is an Indian online gift store in Navsari, Gujarat specialising in curated hampers, personalised keepsakes, custom engravings, and corporate gifting. Free delivery across India. Shop birthday, anniversary, wedding, and festive gifts.",
    telephone: "+91-8160572007",
    email: "support@upharvilla.in",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Razorpay",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Central Bazzar, Tigra Road",
      addressLocality: "Navsari",
      addressRegion: "Gujarat",
      postalCode: "396445",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 20.9467,
      longitude: 72.952,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "19:00",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Gift Collections",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Customized Gifts",
        },
        {
          "@type": "OfferCatalog",
          name: "Corporate Gifts",
        },
        {
          "@type": "OfferCatalog",
          name: "Gift Hampers",
        },
        {
          "@type": "OfferCatalog",
          name: "Trending Gifts",
        },
      ],
    },
  };

  return (
    <>
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={storeSchema} />
    </>
  );
}
