// src/features/landing/pages/LandingPage.tsx

import React from "react";

import TopNav from "../../../features/landing/components/TopNav";
import HeroSplit from "../../../features/landing/components/HeroSplit";
import TradesMarquee from "../../../features/landing/components/TradesMarquee";
import FeaturedPros from "../../../features/landing/components/FeaturedProps";
import StatsGrid from "../../../features/landing/components/StatsGrids";
import ContactSection from "../../../features/landing/components/ContactSection";
import SideFooter from "../../../features/landing/components/SideFooter";
import FAQSection from "../../../features/landing/components/FAQSection";

// Page-scoped styles (previously `globalStyles` was referenced but never defined).
// Keep this minimal — real global styles belong in index.css / a styled layer.
const globalStyles = `
  .skilled-page {
    min-height: 100vh;
    width: 100%;
    position: relative;
    isolation: isolate;
  }
  .skilled-page main {
    position: relative;
    z-index: 0;
  }
`;

const LandingPage: React.FC = () => {
  return (
    <div className="skilled-page">
      <style>{globalStyles}</style>

      <TopNav />

      <main className="relative z-0 isolate">
        <HeroSplit />
        <TradesMarquee />
        <FeaturedPros />
        <StatsGrid />
        <FAQSection />
        <ContactSection />
      </main>

      <SideFooter />
    </div>
  );
};

export default LandingPage;