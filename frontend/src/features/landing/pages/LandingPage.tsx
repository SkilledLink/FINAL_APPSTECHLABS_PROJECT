import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import ContactSection from "../components/ContactSection";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import PricingSection from "../components/PricingSection";
import ProfessionalShowcase from "../components/ProfessionalShowcase";
import ScrollProgress from "../components/ScrollProgress";
import Testimonials from "../components/Testimonials";
import TradeShowcase from "../components/TradeShowcase";
import WorkGallery from "../components/WorkGallery";
import { globalStyles } from "../styles";

const SECTION_IDS = [
  "trades",
  "professionals",
  "work",
  "pricing",
  "testimonials",
  "faq",
  "contact",
] as const;

export default function Landing() {
  const prefersReduced = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<string>("trades");

  useLayoutEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setLoading(false);
      return;
    }
    const t = window.setTimeout(() => setLoading(false), 850);
    return () => window.clearTimeout(t);
  }, [prefersReduced]);

  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loading]);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveNav(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

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
}