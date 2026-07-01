"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const AnnouncementBar = () => {
  const pathname = usePathname();
  const text = "Free delivery : 0 INR charges order within time slots !";
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only show on home page and product pages
  const isHomePage = pathname === "/";
  const isProductPage = pathname?.startsWith("/product/");

  if (!isHomePage && !isProductPage) return null;

  return (
    <div
      style={{
        maxHeight: visible ? "40px" : "0px",
        opacity: visible ? 1 : 0,
        overflow: "hidden",
        transition:
          "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
      }}
      className="w-full bg-primary select-none border-b border-primary/10 relative flex justify-center items-center"
    >
      <div className="py-1.5 md:py-2.5 w-full overflow-hidden relative flex justify-center items-center h-8 md:h-10">
        <style>{`
          @keyframes announcement-slide {
            0% {
              transform: translateX(100vw);
              opacity: 0;
            }
            8% {
              transform: translateX(0);
              opacity: 1;
            }
            92% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(-100vw);
              opacity: 0;
            }
          }
          .animate-announcement {
            animation: announcement-slide 7.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          }
        `}</style>

        <div className="animate-announcement flex items-center justify-center gap-1.5 md:gap-2.5 text-white font-medium text-[11px] sm:text-sm lg:text-base tracking-wide absolute whitespace-nowrap">
          <img
            src="/delivery-rider.webp"
            alt="Rider"
            className="h-8 w-8 md:h-16 md:w-16 select-none"
          />
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
