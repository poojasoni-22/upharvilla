import type { Metadata } from "next";
import { IBM_Plex_Mono, Libre_Baskerville, Poppins } from "next/font/google";
import "./globals.css";

const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const fontSerif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://upharvilla.in"),
  title: {
    default: "upharVilla — Thoughtful Gifts for Every Occasion",
    template: "%s | upharVilla",
  },
  description:
    "upharVilla is India's premier online gift shop offering curated hampers, personalised keepsakes, custom engravings, and corporate gifting solutions for birthdays, anniversaries, weddings, and every special occasion. Shop now for free delivery across India.",
  keywords: [
    "gifts online India",
    "personalised gifts",
    "custom hampers",
    "corporate gifts India",
    "birthday gifts",
    "anniversary gifts",
    "wedding gifts",
    "gift hampers",
    "custom engraving",
    "upharVilla",
    "Navsari gifts",
    "Gujarat gifts online",
    "send gifts India",
    "trending gifts",
    "customized gifts",
  ],
  authors: [{ name: "upharVilla", url: "https://upharvilla.in" }],
  creator: "upharVilla",
  publisher: "upharVilla",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://upharvilla.in",
    siteName: "upharVilla",
    title: "upharVilla — Thoughtful Gifts for Every Occasion",
    description:
      "Discover curated, customisable gifts for birthdays, anniversaries, weddings & more. Shop hampers, personalised keepsakes, and trending gifts at upharVilla. Free delivery across India.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "upharVilla — Thoughtful Gifts for Every Occasion",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "upharVilla — Thoughtful Gifts for Every Occasion",
    description:
      "India's premier online gift shop — custom hampers, personalised keepsakes & corporate gifting. Free delivery across India.",
    images: ["/opengraph-image.png"],
    // TODO: Add @upharVilla twitter handle when available
    // site: "@upharVilla",
    // creator: "@upharVilla",
  },
  alternates: {
    canonical: "https://upharvilla.in",
  },
  category: "E-commerce",
  other: {
    "google-site-verification": "TODO_ADD_VERIFICATION_CODE",
  },
};

import { Toaster } from "sonner";
import { ConvexClientProvider } from "@/provider/ConvexClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance: preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Mobile splash / browser-chrome colors */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="background-color" content="#ffffff" />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          {children}
          <Toaster position="top-center" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
