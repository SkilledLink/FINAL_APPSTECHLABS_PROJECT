// src/features/landing/components/LandingPage.tsx
import React from 'react';

import TopNav from '../components/TopNav';
import HeroSplit from '../components/HeroSplit';
import HowItWorks from '../components/HowItWorks';
import TradesMarquee from '../components/TradesMarquee';
import ProfessionalDiscovery from '../components/ProfessionalDiscovery';
import AISection from '../components/AISection';
import FeaturedPros from '../components/FeaturedProps';
import ForProfessionals from '../components/ForProfessionals';
import ProductShowcase from '../components/ProductShowcase';
import StatsGrid from '../components/StatsGrids';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import SideFooter from '../components/SideFooter';

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950">
      <TopNav />

      <main className="relative z-0">
        <HeroSplit />
        <HowItWorks />
        <TradesMarquee />
        <ProfessionalDiscovery />
        <AISection />
        <FeaturedPros />
        <ForProfessionals />
        <ProductShowcase />
        <StatsGrid />
        <FAQSection />
        <ContactSection />
      </main>

      <SideFooter />
    </div>
  );
};

export default LandingPage;