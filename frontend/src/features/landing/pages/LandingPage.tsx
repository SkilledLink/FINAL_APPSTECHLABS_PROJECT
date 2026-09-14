import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Mail,
  Menu,
  MapPin,
  MessageCircle,
  Star,
  Phone,
  X,
} from "lucide-react";


const professionals = [
  {
    name: "Samuel N.",
    role: "Electrician",
    location: "Yaoundé",
    rating: "4.9",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ouvrier%20travaux%20publics%2019.jpg?width=1400",
  },
  {
    name: "Carine M.",
    role: "Tailor & Designer",
    location: "Douala",
    rating: "4.8",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Couturi%C3%A8re%20dans%20son%20atelier.jpg?width=1400",
  },
  {
    name: "Kondo A.",
    role: "Leather Artisan",
    location: "Maroua",
    rating: "4.9",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cr%C3%A9ateur%20et%20cordonnier%20des%20chaussures%20en%20cuire.jpg?width=1400",
  },
];

const tradeCards = [
  { name: "Electricians", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ouvrier%20travaux%20publics%2019.jpg?width=900" },
  { name: "Builders", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Construction%20Workers%20in%20Douala.jpg?width=900" },
  { name: "Welders", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Soudeur%20au%20travail1.jpg?width=900" },
  { name: "Tailors", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Couturi%C3%A8re%20dans%20son%20atelier.jpg?width=900" },
  { name: "Leather Artisans", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Un%20artisan.jpg?width=900" },
  { name: "Road Workers", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ouvriers%20Routiers%2025.jpg?width=900" },
  { name: "Mechanics", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Femme%20mecanicienne.jpg?width=900" },
  { name: "Local Makers", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Couturier%20ambulant%20au%20travail.jpg?width=900" },
];

const testimonials = [
  { quote: "I found a professional for a small repair in Douala without having to ask around for days. The profile made it easier to compare the work first.", name: "Amina N.", role: "Homeowner · Douala" },
  { quote: "SkilledLink gives me a place to show what I actually make. Clients can see my previous work before they contact me.", name: "Marc T.", role: "Carpenter · Buea" },
  { quote: "For our renovation in Yaoundé, having the professional, location and project details in one place made the process much clearer.", name: "Daniel K.", role: "Project manager · Yaoundé" },
];

const faqs = [
  { question: "How do I find a professional in Cameroon?", answer: "Browse by trade and city, compare profiles and completed work, then contact the professional directly from SkilledLink." },
  { question: "Are professionals verified?", answer: "SkilledLink is designed around professional profiles, work history and community feedback so clients can make a more informed choice. Verification status should always be checked on the individual profile." },
  { question: "Can I join as a skilled professional?", answer: "Yes. Create your professional profile, add your trade and location, and showcase completed work so clients can discover what you do." },
  { question: "What currency does SkilledLink use?", answer: "For Cameroon-focused examples, prices are displayed in FCFA (XAF), such as 25,000 FCFA or 150,000 FCFA, instead of dollars." },
  { question: "How do I contact SkilledLink?", answer: "Send a message through the contact form or use hello@skilledlink.com. The team can help with finding professionals, joining the network or partnerships." },
];

const pricingExamples = [
  { label: "Quick repair", amount: "25,000 FCFA", detail: "Example starting point" },
  { label: "Home improvement", amount: "75,000 FCFA", detail: "Example project budget" },
  { label: "Technical installation", amount: "150,000 FCFA", detail: "Example project budget" },
  { label: "Larger renovation", amount: "450,000 FCFA", detail: "Example project budget" },
];

const workImages = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Construction%20Workers%20in%20Douala.jpg?width=1400",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Soudeur%20au%20travail1.jpg?width=1400",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Couturi%C3%A8re%20dans%20son%20atelier.jpg?width=1400",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Cr%C3%A9ateur%20et%20cordonnier%20des%20chaussures%20en%20cuire.jpg?width=1400",
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("trades");
  const [openFaq, setOpenFaq] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("#contact form");
    if (!form) return;

    const handleContactSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      const inputs = form.querySelectorAll<HTMLInputElement>("input");
      const textarea = form.querySelector<HTMLTextAreaElement>("textarea");
      setContactStatus("sending");

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/contact-messages`,
          {
            name: inputs[0]?.value.trim() || "",
            email: inputs[1]?.value.trim() || "",
            message: textarea?.value.trim() || contactMessage,
          },
        );
        form.reset();
        setContactName("");
        setContactEmail("");
        setContactMessage("");
        setContactStatus("sent");
      } catch {
        setContactStatus("error");
      }
    };

    form.addEventListener("submit", handleContactSubmit, true);
    return () => form.removeEventListener("submit", handleContactSubmit, true);
  }, [contactMessage]);

  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    revealRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (visibleSection?.target.id) {
          setActiveNav(visibleSection.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    document.querySelectorAll("#trades, #professionals, #pricing, #work, #testimonials, #faq, #contact")
      .forEach((section) => sectionObserver.observe(section));

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const addRevealRef = (element: HTMLElement | null) => {
    if (element && !revealRefs.current.includes(element)) {
      revealRefs.current.push(element);
    }
  };

  return (
    <div className="skilled-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0f172a;
        }

        .skilled-page {
          background: #0f172a;
          color: #f5f2ea;
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }


        .skilled-page section:not(:first-of-type) {
          padding-block: clamp(2rem, 4vw, 4rem) !important;
          min-height: auto !important;
        }

        .skilled-page h2 {
          font-size: clamp(1.5rem, 3vw, 3rem) !important;
          line-height: 1.05 !important;
          letter-spacing: -0.025em !important;
        }

        .skilled-page section:not(:first-of-type) p {
          font-size: 0.95rem !important;
          line-height: 1.6 !important;
        }

        .skilled-page .image-wrap {
          max-height: 320px;
        }

        .skilled-page .image-wrap img {
          max-height: 320px;
        }

        .skilled-page section:not(:first-of-type) img {
          max-height: 320px !important;
        }

        .skilled-page section:not(:first-of-type) .trade-marquee a {
          height: 12rem !important;
        }

        .skilled-page section:not(:first-of-type) [class*="min-h-"] {
          min-height: 0 !important;
        }

        .skilled-page article {
          min-height: 12rem !important;
        }

        .skilled-page .work-proof-section {
          background: #e7f0ff !important;
          border-top: 4px solid #2563eb;
          border-bottom: 4px solid #2563eb;
        }

        .skilled-page .work-proof-section h2 {
          color: #0f172a !important;
        }

        .skilled-page .work-proof-section .image-wrap {
          border: 3px solid #bfdbfe !important;
          box-shadow: 0 18px 40px rgba(37, 99, 235, 0.2);
        }

        .skilled-page .work-proof-section .image-wrap::after {
          content: "PROOF OF WORK";
          position: absolute;
          left: 1rem;
          top: 1rem;
          z-index: 2;
          border-radius: 999px;
          background: #2563eb;
          padding: 0.4rem 0.7rem;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .skilled-page .work-proof-section .image-wrap::before {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          z-index: 2;
          max-width: calc(100% - 2rem);
          border-radius: 0.75rem;
          background: rgba(15, 23, 42, 0.88);
          padding: 0.75rem 1rem;
          color: white;
          white-space: pre-line;
          font-size: 0.8rem;
          font-weight: 700;
          line-height: 1.5;
          backdrop-filter: blur(10px);
        }

        .skilled-page .work-proof-section .image-wrap:nth-child(1)::before {
          content: "Modern kitchen installation\\A Carpentry · Buea\\A Completed in 6 days";
        }

        .skilled-page .work-proof-section .image-wrap:nth-child(2)::before {
          content: "Residential electrical upgrade\\A Electrical work · Douala\\A Completed and tested";
        }

        .skilled-page .work-proof-section .image-wrap:nth-child(3)::before {
          content: "Custom metalwork project\\A Welding · Yaounde\\A Delivered on schedule";
        }

        .skilled-page .intro-section {
          padding-block: 1rem !important;
        }

        .skilled-page .intro-section h2 {
          font-size: clamp(1.1rem, 1.8vw, 1.6rem) !important;
        }

        .skilled-page .search-section {
          padding-block: 0.75rem !important;
        }

        .skilled-page .search-section h2 {
          font-size: clamp(1.1rem, 1.8vw, 1.6rem) !important;
        }

        .skilled-page .search-section input,
        .skilled-page .search-section button {
          min-height: 1.9rem;
        }

        .serif {
          font-family: Georgia, "Times New Roman", serif;
        }

        .reveal {
          opacity: 0;
          transform: translateY(60px);
          transition:
            opacity 900ms cubic-bezier(.22,1,.36,1),
            transform 900ms cubic-bezier(.22,1,.36,1);
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-delay-1 {
          transition-delay: 120ms;
        }

        .reveal-delay-2 {
          transition-delay: 220ms;
        }

        .reveal-delay-3 {
          transition-delay: 320ms;
        }

        .hero-image {
          animation: heroZoom 14s ease-in-out infinite alternate;
        }

        @keyframes heroZoom {
          from {
            transform: scale(1);
          }

          to {
            transform: scale(1.08);
          }
        }

        .slow-float {
          animation: floatImage 7s ease-in-out infinite;
        }

        @keyframes floatImage {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-18px) rotate(1deg);
          }
        }

        .trade-marquee {
          animation: tradeMarquee 42s linear infinite;
        }

        @keyframes tradeMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-50% - 10px));
          }
        }

        .pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% {
            transform: scale(1);
            opacity: .8;
          }

          50% {
            transform: scale(1.4);
            opacity: 1;
          }
        }

        .magnetic-button {
          transition:
            transform 300ms cubic-bezier(.22,1,.36,1),
            background 300ms ease;
        }

        .magnetic-button:hover {
          transform: translateY(-4px);
        }

        .image-hover {
          transition: transform 900ms cubic-bezier(.22,1,.36,1);
        }

        .image-wrap:hover .image-hover {
          transform: scale(1.06);
        }

        .image-wrap {
          box-shadow: 0 24px 60px rgba(2, 6, 23, .22);
        }

        .mobile-drawer {
          background: #020617 !important;
          opacity: 0;
          pointer-events: none;
          transform: translateX(100%);
          transition: opacity 250ms ease, transform 350ms cubic-bezier(.22,1,.36,1);
        }

        .mobile-drawer.is-open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }

        .mobile-drawer-backdrop {
          background: #020617 !important;
          opacity: 0;
          pointer-events: none;
          transition: opacity 250ms ease;
        }

        .mobile-drawer-backdrop.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-drawer-link {
          opacity: 0;
          transform: translateX(24px);
          transition: opacity 300ms ease, transform 350ms ease;
        }

        .mobile-drawer.is-open .mobile-drawer-link {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-drawer.is-open .mobile-drawer-link:nth-child(2) { transition-delay: 50ms; }
        .mobile-drawer.is-open .mobile-drawer-link:nth-child(3) { transition-delay: 100ms; }
        .mobile-drawer.is-open .mobile-drawer-link:nth-child(4) { transition-delay: 150ms; }
        .mobile-drawer.is-open .mobile-drawer-link:nth-child(5) { transition-delay: 200ms; }

        @media (max-width: 640px) {
          .skilled-page {
            overflow-x: hidden;
          }

          .magnetic-button:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 md:px-10">
          <a href="#" className="text-lg font-bold tracking-tight">
            <span className="text-[#2563EB]">Skilled</span><span className="text-white">Link</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
            <a href="#trades" onClick={() => setActiveNav("trades")} className={`transition hover:text-blue-400 ${activeNav === "trades" ? "text-blue-400" : ""}`}>Discover</a>
            <a href="#professionals" onClick={() => setActiveNav("professionals")} className={`transition hover:text-blue-400 ${activeNav === "professionals" ? "text-blue-400" : ""}`}>Professionals</a>
            <a href="#work" onClick={() => setActiveNav("work")} className={`transition hover:text-blue-400 ${activeNav === "work" ? "text-blue-400" : ""}`}>Show your work</a>
            <a href="#pricing" onClick={() => setActiveNav("pricing")} className={`transition hover:text-blue-400 ${activeNav === "pricing" ? "text-blue-400" : ""}`}>Pricing</a>
            <a href="#testimonials" onClick={() => setActiveNav("testimonials")} className={`transition hover:text-blue-400 ${activeNav === "testimonials" ? "text-blue-400" : ""}`}>Reviews</a>
            <a href="#faq" onClick={() => setActiveNav("faq")} className={`transition hover:text-blue-400 ${activeNav === "faq" ? "text-blue-400" : ""}`}>FAQ</a>
            <a href="#contact" onClick={() => setActiveNav("contact")} className={`transition hover:text-blue-400 ${activeNav === "contact" ? "text-blue-400" : ""}`}>Contact</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button className="px-4 py-2 text-sm font-medium text-white">Log in</button>
            <button className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]">Join SkilledLink</button>
          </div>

          <button aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/40 text-white backdrop-blur lg:hidden">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`mobile-drawer-backdrop fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} />
        <aside className={`mobile-drawer fixed bottom-0 right-0 top-0 z-50 w-[min(85vw,360px)] bg-slate-950 p-7 shadow-2xl lg:hidden ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-blue-300">Menu</span>
            <button aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl text-white">&times;</button>
          </div>
          <nav className="mt-10 flex flex-col gap-7 text-xl">
            <a href="#trades" onClick={() => { setActiveNav("trades"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "trades" ? "text-blue-400" : "text-white"}`}>Discover</a>
            <a href="#professionals" onClick={() => { setActiveNav("professionals"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "professionals" ? "text-blue-400" : "text-white"}`}>Professionals</a>
            <a href="#work" onClick={() => { setActiveNav("work"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "work" ? "text-blue-400" : "text-white"}`}>Show your work</a>
            <a href="#pricing" onClick={() => { setActiveNav("pricing"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "pricing" ? "text-blue-400" : "text-white"}`}>Pricing</a>
            <a href="#testimonials" onClick={() => { setActiveNav("testimonials"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "testimonials" ? "text-blue-400" : "text-white"}`}>Reviews</a>
            <a href="#faq" onClick={() => { setActiveNav("faq"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "faq" ? "text-blue-400" : "text-white"}`}>FAQ</a>
            <a href="#contact" onClick={() => { setActiveNav("contact"); setMenuOpen(false); }} className={`mobile-drawer-link ${activeNav === "contact" ? "text-blue-400" : "text-white"}`}>Contact</a>
          </nav>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-12 flex items-center justify-center rounded-full bg-[#2563EB] py-3 font-bold text-white">Join SkilledLink</a>
        </aside>
      </header>

      <section className="relative flex min-h-screen items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2200&q=90" alt="Construction professional working on a building site" className="hero-image h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-blue-950/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-12 pt-36 md:px-10 md:pb-16 md:pt-40">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-8 flex items-center gap-3 text-sm text-white/95"><span className="pulse-dot h-2 w-2 rounded-full bg-white" />Connecting people with skilled hands.</div>
              <h1 className="max-w-5xl text-[15vw] font-medium leading-[0.86] tracking-[-0.07em] text-white sm:text-[16vw] md:text-[11vw] lg:text-[9vw]">Find the<span className="serif ml-3 italic font-normal">skill.</span></h1>
              <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end">
                <p className="max-w-md text-base leading-7 text-white/75 md:text-lg">Discover people who know how to build, repair, create and make things happen.</p>
                <a href="#trades" className="magnetic-button inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2563EB] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 sm:w-fit">Start exploring<ArrowDown size={17} /></a>
              </div>
            </div>
            <div className="hidden max-w-[260px] text-right lg:block"><div className="mb-3 ml-auto h-px w-20 bg-white/70" /><p className="text-sm leading-6 text-white/90">A professional network built around real skills, real work and real people.</p></div>
          </div>
        </div>
        <div className="absolute bottom-7 right-10 hidden text-xs uppercase tracking-[0.3em] text-white/90 md:block">Scroll to explore</div>
      </section>

      <section id="trades" className="overflow-hidden py-20 md:py-28"><div className="mx-auto max-w-[1500px] px-5 md:px-10"><div ref={addRevealRef} className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.3em] text-white/40">Explore the directory / 02</p><h2 className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-5xl">Every trade has a <span className="serif ml-3 italic text-white/45">story.</span></h2></div><p className="max-w-sm leading-7 text-white/50">Browse the people who build, repair and shape everyday life in your community.</p></div></div><div className="mt-10 overflow-hidden border-y border-white/10 py-5"><div className="trade-marquee flex w-max gap-5">{[...tradeCards, ...tradeCards].map((trade, index) => (<a href="#discover" key={`${trade.name}-${index}`} className="group relative h-64 w-56 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-80 sm:w-72"><img src={trade.image} alt={trade.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" /><span className="absolute bottom-5 left-5 text-xl font-semibold text-white">{trade.name}</span></a>))}</div></div></section>

      <section id="professionals" className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-40"><div className="grid items-center gap-16 lg:grid-cols-[.7fr_1.3fr]"><div ref={addRevealRef} className="reveal"><p className="text-xs uppercase tracking-[0.3em] text-white/40">Professionals / 02</p><h2 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">Meet the people<span className="serif ml-2 block italic text-white/45">behind the work.</span></h2><p className="mt-8 max-w-md leading-7 text-white/50">Profiles built around experience, completed work and reputation — not just a name and a phone number.</p><button className="magnetic-button mt-9 flex items-center gap-3 rounded-full border border-blue-400/40 px-6 py-4 text-sm font-bold text-white transition hover:border-blue-400 hover:bg-[#2563EB]">Explore professionals<ArrowRight size={17} /></button></div><div className="grid gap-5 sm:grid-cols-2"><div ref={addRevealRef} className="reveal image-wrap relative overflow-hidden rounded-[2rem] border border-white/10 sm:row-span-2"><img src={professionals[0].image} alt={professionals[0].name} className="image-hover h-[430px] w-full object-cover sm:h-[620px]" /><div className="absolute inset-x-5 bottom-5 rounded-2xl bg-black/60 p-5 backdrop-blur-xl"><div className="flex items-end justify-between"><div><p className="text-2xl font-bold text-white">{professionals[0].name}</p><p className="mt-1 text-sm text-white/60">{professionals[0].role}</p></div><div className="flex items-center gap-1 text-sm font-bold"><Star size={15} className="fill-white text-white" />{professionals[0].rating}</div></div><div className="mt-4 flex items-center gap-2 text-xs text-white/50"><MapPin size={14} />{professionals[0].location}<CheckCircle2 size={14} className="ml-2 text-white" />Verified</div></div></div><div ref={addRevealRef} className="reveal reveal-delay-1 image-wrap relative overflow-hidden rounded-[2rem] border border-white/10"><img src={professionals[1].image} alt={professionals[1].name} className="image-hover h-[240px] w-full object-cover sm:h-[295px]" /><div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/60 p-4 backdrop-blur"><p className="font-bold">{professionals[1].name}</p><p className="text-xs text-white/60">{professionals[1].role} · {professionals[1].location}</p></div></div><div ref={addRevealRef} className="reveal reveal-delay-2 image-wrap relative overflow-hidden rounded-[2rem] border border-white/10"><img src={professionals[2].image} alt={professionals[2].name} className="image-hover h-[240px] w-full object-cover sm:h-[295px]" /><div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/60 p-4 backdrop-blur"><p className="font-bold">{professionals[2].name}</p><p className="text-xs text-white/60">{professionals[2].role} · {professionals[2].location}</p></div></div></div></div></section>

      <section id="pricing" className="bg-white py-20 text-slate-950 md:py-28">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <div ref={addRevealRef} className="reveal grid gap-8 md:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Local pricing / 03</p>
              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">Built for Cameroon, with money examples that make sense locally.</p>
            </div>
            <div>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <h2 className="max-w-3xl text-4xl font-medium leading-[0.95] tracking-[-0.04em] md:text-6xl">
                  Clear numbers. <span className="serif italic text-blue-700">No dollar signs.</span>
                </h2>
                <span className="rounded-full bg-[#f5f2ea] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">XAF · FCFA</span>
              </div>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">Examples below are illustrative, not fixed SkilledLink prices. Final prices can depend on the professional, scope, materials and location.</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pricingExamples.map((item, index) => (
                  <div key={item.label} ref={addRevealRef} className={`reveal reveal-delay-${index + 1} rounded-2xl bg-slate-50 p-5`}>
                    <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                    <p className="mt-4 text-2xl font-bold tracking-tight">{item.amount}</p>
                    <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="work-proof-section bg-blue-50 py-24 text-slate-900 md:py-40"><div className="mx-auto max-w-[1500px] px-5 md:px-10"><div ref={addRevealRef} className="reveal grid gap-8 md:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs uppercase tracking-[0.3em] text-blue-700">Proof of work / 04</p></div><div><h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">Don't just say<span className="serif ml-3 italic text-blue-700">you can.</span><br />Show it.</h2><p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Completed work gives people confidence. See the projects, details and craft behind every professional.</p></div></div><div className="mt-12 grid gap-5 sm:mt-20 md:grid-cols-12 md:grid-rows-2"><div ref={addRevealRef} className="reveal image-wrap overflow-hidden rounded-[2rem] border border-blue-100 md:col-span-7 md:row-span-2"><img src={workImages[0]} alt="Professional construction work" className="image-hover h-[360px] w-full object-cover sm:h-[500px] md:h-full md:min-h-[600px]" /></div><div ref={addRevealRef} className="reveal reveal-delay-1 image-wrap overflow-hidden rounded-[2rem] border border-blue-100 md:col-span-5"><img src={workImages[1]} alt="Professional at work" className="image-hover h-[240px] w-full object-cover sm:h-[290px]" /></div><div ref={addRevealRef} className="reveal reveal-delay-2 image-wrap overflow-hidden rounded-[2rem] border border-blue-100 md:col-span-5"><img src={workImages[2]} alt="Skilled craft work" className="image-hover h-[240px] w-full object-cover sm:h-[290px]" /></div></div></div></section>

      <section id="testimonials" className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-36"><div ref={addRevealRef} className="reveal grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs uppercase tracking-[0.3em] text-white/40">From the community</p></div><div><h2 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">People sharing <span className="serif ml-3 italic text-white/45">their experience.</span></h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/50">A few words from people who have used SkilledLink in their everyday work.</p></div></div><div className="mt-14 grid gap-5 md:grid-cols-3">{testimonials.map((testimonial, index) => (<article key={testimonial.name} ref={addRevealRef} className={`reveal reveal-delay-${index + 1} flex min-h-72 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-7`}><div><div className="mb-6 flex gap-1 text-blue-400" aria-label="5 star review">{[...Array(5)].map((_, starIndex) => <Star key={starIndex} size={15} className="fill-current" />)}</div><p className="text-lg leading-8 text-white/80">“{testimonial.quote}”</p></div><div className="mt-8 border-t border-white/10 pt-5"><p className="font-bold text-white">{testimonial.name}</p><p className="mt-1 text-sm text-white/45">{testimonial.role}</p></div></article>))}</div></section>

      <section id="faq" className="bg-blue-50 py-24 text-slate-900 md:py-36"><div className="mx-auto grid max-w-[1100px] gap-12 px-5 md:grid-cols-[.8fr_1.2fr] md:px-10"><div ref={addRevealRef} className="reveal"><p className="text-xs uppercase tracking-[0.3em] text-black/40">Questions / 06</p><h2 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">Answers before you <span className="serif italic text-black/45">start.</span></h2><p className="mt-7 max-w-sm leading-7 text-black/55">A few useful things to know about finding trusted hands and joining the SkilledLink community.</p></div><div ref={addRevealRef} className="reveal space-y-3">{faqs.map((faq, index) => { const isOpen = openFaq === index; return (<div key={faq.question} className="border-b border-black/15"><button onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold">{faq.question}<ChevronDown size={20} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <p className="max-w-xl pb-6 pr-10 leading-7 text-black/60">{faq.answer}</p>}</div>); })}</div></div></section>

      <section id="contact" className="mx-auto max-w-[1100px] px-5 py-20 md:px-10 md:py-28"><div ref={addRevealRef} className="reveal grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-20"><div><p className="text-xs uppercase tracking-[0.3em] text-white/45">Contact SkilledLink / 07</p><h2 className="mt-5 max-w-md text-4xl font-medium leading-tight tracking-tight md:text-5xl">Tell us what you <span className="serif italic text-white/55">need.</span></h2><p className="mt-5 max-w-sm text-white/55">Need help finding a trade, joining the network or partnering with us? Write to our team. We keep the experience local, simple and clear.</p><div className="mt-8 space-y-3 text-sm text-white/65"><a href="mailto:hello@skilledlink.com" className="flex items-center gap-3 transition hover:text-white"><Mail size={16} /> hello@skilledlink.com</a><a href="tel:+237690000000" className="flex items-center gap-3 transition hover:text-white"><Phone size={16} /> +237 690 000 000</a><a href="#faq" className="flex items-center gap-3 transition hover:text-white"><MessageCircle size={16} /> Read FAQs <ArrowRight size={15} /></a></div></div><form className="space-y-4" onSubmit={(event) => event.preventDefault()}><div className="grid gap-4 sm:grid-cols-2"><input aria-label="Your name" placeholder="Your name" className="border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-blue-400" /><input type="email" aria-label="Your email" placeholder="Your email" className="border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-blue-400" /></div><textarea aria-label="Your message" value={contactMessage} onChange={(event) => setContactMessage(event.target.value)} placeholder="Write your message..." rows={4} className="w-full resize-none border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-blue-400" /><button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]">Send message <ArrowRight size={16} /></button></form></div></section>

      <section id="about" className="relative overflow-hidden py-32 md:py-48"><div className="absolute right-[-10%] top-[10%] h-[600px] w-[600px] rounded-full bg-white/[0.025] blur-3xl" /><div className="relative mx-auto max-w-[1500px] px-5 md:px-10"><div className="grid gap-20 lg:grid-cols-2 lg:items-center"><div ref={addRevealRef} className="reveal relative"><div className="slow-float relative mx-auto max-w-lg"><img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=90" alt="Professional working" className="h-[500px] w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl sm:h-[650px]" /><div className="absolute -bottom-7 -right-5 max-w-[250px] rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl md:-right-12"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white"><Check size={19} /></div><p className="font-bold">Skills deserve recognition.</p><p className="mt-2 text-sm leading-6 text-white/45">Build a profile around the work you've actually done.</p></div></div></div><div ref={addRevealRef} className="reveal"><p className="text-xs uppercase tracking-[0.3em] text-white/40">More than a directory</p><h2 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">Give good work<span className="serif ml-3 italic text-white/45">a reputation.</span></h2><div className="mt-10 space-y-7"><StoryItem number="01" title="Build your identity" text="Create a professional profile that represents your skills and experience." /><StoryItem number="02" title="Show your work" text="Turn completed projects into proof that people can actually see." /><StoryItem number="03" title="Get discovered" text="Make it easier for people looking for your skills to find you." /></div></div></div></div></section>

      <section className="relative overflow-hidden bg-slate-950 py-20 md:py-28"><div className="mx-auto max-w-[1100px] px-5 md:px-10"><div ref={addRevealRef} className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs uppercase tracking-[0.25em] text-blue-300">Start with SkilledLink</p><h2 className="mt-4 max-w-2xl text-4xl font-medium leading-tight text-white md:text-5xl">Ready to get started?</h2><p className="mt-4 max-w-xl text-base leading-7 text-white/70">Find trusted help for your next project or create a profile so people can discover your skills.</p><div className="mt-6 grid max-w-xl gap-3 text-sm text-white/75 sm:grid-cols-3"><div><strong className="block text-white">Find help</strong><span>Browse nearby professionals.</span></div><div><strong className="block text-white">Show your work</strong><span>Build a profile around your skills.</span></div><div><strong className="block text-white">Connect directly</strong><span>Talk about the project.</span></div></div></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row"><a href="#trades" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8]">Find a professional <ArrowRight size={16} /></a><a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-blue-300 hover:text-blue-300">Join the community <ArrowRight size={16} /></a></div></div></div></section>

      <footer className="border-t border-white/10 bg-slate-900"><div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-center"><div className="font-bold"><span className="text-[#2563EB]">Skilled</span><span className="text-white">Link</span></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/40"><a href="#discover" className="hover:text-white">Discover</a><a href="#professionals" className="hover:text-white">Professionals</a><a href="#work" className="hover:text-white">Work</a><a href="#about" className="hover:text-white">About</a><span>© {new Date().getFullYear()} SkilledLink</span></div></div></div></footer>
    </div>
  );
}

function StoryItem({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="border-t border-white/10 pt-6"><div className="flex gap-6"><span className="text-xs text-white/30">{number}</span><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 max-w-lg leading-7 text-white/45">{text}</p></div></div></div>;
}