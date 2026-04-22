import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export const MarketingLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink-950 text-fog-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-noise"
      />
      <Navbar />
      <main className="relative pt-16 sm:pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
