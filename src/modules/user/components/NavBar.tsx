"use client";

import Navigation from "./Navigation";

const NavBar = () => {
  return (
    <div
      className="px-0 md:px-4 lg:px-12 xl:px-16 2xl:px-20 py-0.5 md:py-1 bg-white border-y border-border relative z-40 overflow-x-auto md:overflow-visible"
      style={{ scrollbarWidth: "none" }}
    >
      <Navigation />
    </div>
  );
};

export default NavBar;
