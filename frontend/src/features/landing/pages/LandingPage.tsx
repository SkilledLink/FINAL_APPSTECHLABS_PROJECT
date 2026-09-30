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
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f7fb] dark:bg-[#04070e] text-[#0F172A] dark:text-slate-100 transition-colors duration-500">

      {/* =========================================================
          BACKGROUND SYSTEM · layered atmosphere (matches AuthLayout)
          Fixed so it stays behind content as you scroll — parallax feel.
      ========================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

        {/* 1 · Base vertical wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/[0.03] dark:to-blue-500/[0.05]" />

        {/* 2 · Primary light source — top-left */}
        <div className="absolute -top-[42%] -left-[22%] w-[1200px] h-[1200px] rounded-full bg-blue-400/[0.12] dark:bg-blue-600/[0.14] blur-[180px]" />

        {/* 3 · Counterweight — bottom-right */}
        <div className="absolute -bottom-[42%] -right-[22%] w-[1000px] h-[1000px] rounded-full bg-indigo-300/[0.10] dark:bg-indigo-700/[0.10] blur-[180px]" />

        {/* 4 · Precision grid — radial-masked so it fades in from nothing */}
        <div
          className="absolute inset-0"
          style={{
            maskImage:
              "radial-gradient(ellipse 75% 70% at 50% 45%, black 15%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 70% at 50% 45%, black 15%, transparent 80%)",
          }}
        >
          <svg
            className="w-full h-full text-slate-900/[0.05] dark:text-white/[0.045]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="landing-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
          </svg>
        </div>

        {/* 5 · Film grain — the premium texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.16] dark:opacity-[0.26] mix-blend-overlay"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="landing-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#landing-noise)" />
        </svg>

        {/* 6 · Deep vignette — cinematic focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent_40%,rgba(15,23,42,0.06)_100%)] dark:bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

        {/* 7 · Top hairline — architectural frame */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-900/[0.06] dark:via-white/[0.06] to-transparent" />
      </div>

      {/* =========================================================
          CONTENT · above the background layers
      ========================================================== */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <TopNav />

        <main>

          {/* HERO */}
          <HeroSplit />

          {/* TRADES */}
          <TradesMarquee />

          {/* PROFESSIONALS */}
          <FeaturedPros />

          {/* THE PROBLEM / NEED WORK */}
          <StatsGrid />

          {/* TESTIMONIALS */}
          <FAQSection />

          {/* CONTACT */}
          <ContactSection />

          {/* FINAL CTA */}

        </main>

        {/* FOOTER */}
        <SideFooter />

      </div>
    </div>
  );
};

export default LandingPage;