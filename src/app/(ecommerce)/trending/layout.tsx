import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Gifts",
  description:
    "Shop the most popular and trending gifts at upharVilla — best-selling hampers, personalised keepsakes, and top-rated gift combos.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
