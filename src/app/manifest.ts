import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "upharVilla — Thoughtful Gifts for Every Occasion",
    short_name: "upharVilla",
    description:
      "India's premier online gift shop — curated hampers, personalised keepsakes, custom engravings & corporate gifting for every occasion.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
