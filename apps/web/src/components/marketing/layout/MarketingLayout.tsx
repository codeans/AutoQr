import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { SEO } from "../../SEO";

export const MarketingLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-content">
      <SEO />
      <Navbar />
      <main className="relative pt-16 sm:pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
