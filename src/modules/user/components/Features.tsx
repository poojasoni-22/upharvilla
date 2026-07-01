"use client";

import { Headset, RotateCcw, Truck } from "lucide-react";
import React from "react";
import { authClient } from "@/lib/auth-client";

const Features = () => {
  const { data: session } = authClient.useSession();

  if (session) return null;

  const featureList = [
    {
      icon: <Truck strokeWidth={1.5} className="w-8 h-8" />,
      title: "Free Shipping",
      description: "Pan-India free shipping on most orders",
    },
    {
      icon: <Headset strokeWidth={1.5} className="w-8 h-8" />,
      title: "Support 24/7",
      description: "Dedicated assistance whenever you need it",
    },
    {
      icon: <RotateCcw strokeWidth={1.5} className="w-8 h-8 " />,
      title: "Easy Returns",
      description: "Hassle-free 48-hour replacement policy",
    },
  ];

  return (
    <div className="md:py-14 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8">
      {/* Mobile: all 3 fit in one row */}
      <div className="flex md:hidden gap-2 justify-between">
        {featureList.map((feature, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center text-center"
          >
            <div className="mb-1.5 p-2 rounded-full bg-primary border border-neutral-100 text-white! ">
              {React.cloneElement(feature.icon, { className: "w-4 h-4" })}
            </div>
            <h3 className="text-[10px] font-semibold text-neutral-900 tracking-tight">
              {feature.title}
            </h3>
          </div>
        ))}
      </div>
      {/* Desktop: original row layout */}
      <div className="hidden md:flex items-center justify-between max-w-[1400px] mx-auto px-8 lg:px-12 py-4 lg:py-6">
        {featureList.map((feature, index) => (
          <React.Fragment key={index}>
            <div className="flex-1 flex flex-col items-center text-center px-10 group cursor-default">
              <div className="mb-6 p-4 rounded-full bg-primary border border-neutral-100 text-white! ">
                {feature.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-neutral-800 mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm lg:text-base text-neutral-500 mt-0.5 leading-relaxed max-w-[220px]">
                {feature.description}
              </p>
            </div>
            {index < featureList.length - 1 && (
              <div className="self-center w-[1.5px] h-32 bg-neutral-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Features;
