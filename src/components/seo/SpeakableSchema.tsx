import { JsonLd } from "./JsonLd";

/**
 * SpeakableSpecification JSON-LD — marks key content for voice/AI engines.
 * Helps Google Assistant, Alexa, and AI Overviews identify the most
 * important sentences on the page.
 */
export function SpeakableSchema() {
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "upharVilla — Thoughtful Gifts for Every Occasion",
    url: "https://upharvilla.in",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        ".hero-description",
        ".villa-summary",
        ".llm-context",
        "h1",
        "[data-speakable]",
      ],
    },
    mainEntity: {
      "@type": "OnlineStore",
      name: "upharVilla",
      url: "https://upharvilla.in",
    },
  };

  return <JsonLd schema={speakableSchema} />;
}
