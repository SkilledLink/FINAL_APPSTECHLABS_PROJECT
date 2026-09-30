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
    <div className="skilled-page">
      <style>{globalStyles}</style>

      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>

      <ScrollProgress />

      <Navbar activeNav={activeNav} onNavigate={setActiveNav} />

      <main className="relative z-0 isolate">
        <Hero ready={!loading} />
        <TradeShowcase />
        <ProfessionalShowcase />
        <WorkGallery />
        <PricingSection />
        <Testimonials />
        <FAQ />
        <ContactSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;