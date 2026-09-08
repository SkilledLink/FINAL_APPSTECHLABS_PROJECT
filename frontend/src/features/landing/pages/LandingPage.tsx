import React, { useState, useEffect } from 'react';
import {Navbar}  from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FeaturedShowcase } from '../components/FeaturedShowcase';
import { FeaturesSection } from '../components/FeaturesSection';
import { StatsSection } from '../components/StatsSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FAQSection } from '../components/FAQSection';
import { BlogPreviewSection } from '../components/BlogPreviewSection';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';
import { BackToTop } from '../components/BackToTop';

export const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background Mesh Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Sticky Glass Navbar */}
      <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />

      {/* Main Feature Sections */}
      <main className="relative z-10 space-y-6">
        <HeroSection />
        <HowItWorksSection />
        <FeaturedShowcase />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <FAQSection />
        <BlogPreviewSection />
        <CtaSection />
      </main>

      {/* Footer & Back To Top Trigger */}
      <Footer />
      <BackToTop />
    </div>
  );
};

export default LandingPage;