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

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#06142e] transition-colors duration-500 dark:bg-slate-950 dark:text-white">
      <TopNav />

      <main>
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