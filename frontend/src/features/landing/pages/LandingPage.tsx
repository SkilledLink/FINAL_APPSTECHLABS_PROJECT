import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Menu,
  Moon,
  Star,
  Sun,
  X,
} from "lucide-react";

const professionals = [
  {
    name: "Samuel N.",
    role: "Builder",
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
  { name: "Contractors", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ouvrier%20travaux%20publics%2019.jpg?width=900" },
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
  { question: "Are professionals verified?", answer: "SkilledLink is designed around professional profiles, work history and community feedback so clients can make a more informed choice." },
  { question: "Can I join as a skilled professional?", answer: "Yes. Create your professional profile, add your trade and location, and showcase completed work so clients can discover what you do." },
  { question: "What currency does SkilledLink use?", answer: "For Cameroon-focused examples, prices are displayed in FCFA (XAF), such as 25,000 FCFA or 150,000 FCFA." },
  { question: "How do I contact SkilledLink?", answer: "Send a message through the contact form or use hello@skilledlink.com." },
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("trades");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
      { threshold: 0.12 }
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/contact-messages`,
        { name: contactName, email: contactEmail, message: contactMessage }
      );
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactStatus("sent");
    } catch {
      setContactStatus("error");
    }
  };

  return (
    <div className={`skilled-page ${theme === "dark" ? "dark-linkedin" : "light-mode"}`}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        /* Pure Light Mode Theme */
        .skilled-page.light-mode {
          background-color: #ffffff;
          color: #0f172a;
          --bg-nav: rgba(255, 255, 255, 0.9);
          --border-color: #e2e8f0;
          --card-bg: #f8fafc;
          --subtext: #64748b;
          --heading-color: #0f172a;
        }

        /* LinkedIn Dark Mode Theme */
        .skilled-page.dark-linkedin {
          background-color: #1d2226;
          color: #e8e8e8;
          --bg-nav: rgba(29, 34, 38, 0.92);
          --border-color: #38434f;
          --card-bg: #1b1f23;
          --subtext: #959b9e;
          --heading-color: #ffffff;
        }

        .skilled-page {
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          transition: background-color 300ms ease, color 300ms ease;
        }

        .skilled-page section:not(:first-of-type) {
          padding-block: clamp(2rem, 4vw, 4rem) !important;
        }

        .skilled-page h2 {
          font-size: clamp(1.5rem, 3vw, 3rem) !important;
          line-height: 1.05 !important;
          letter-spacing: -0.025em !important;
          color: var(--heading-color);
        }

        .skilled-page p {
          color: var(--subtext);
        }

        .serif { font-family: Georgia, "Times New Roman", serif; }

        .reveal {
          opacity: 0;
          transform: translateY(60px);
          transition: opacity 900ms cubic-bezier(.22,1,.36,1), transform 900ms cubic-bezier(.22,1,.36,1);
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-image {
          animation: heroZoom 14s ease-in-out infinite alternate;
        }

        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }

        .trade-marquee {
          animation: tradeMarquee 42s linear infinite;
        }

        @keyframes tradeMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 10px)); }
        }

        .magnetic-button {
          transition: transform 300ms cubic-bezier(.22,1,.36,1), background 300ms ease;
        }

        .magnetic-button:hover { transform: translateY(-4px); }

        .mobile-drawer {
          background: var(--card-bg) !important;
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
      `}</style>

      {/* HEADER NAVBAR */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-nav)] backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-[#2563EB]">Skilled</span>
            <span className={theme === "light" ? "text-slate-900" : "text-white"}>Link</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {["trades", "professionals", "work", "pricing", "testimonials", "faq", "contact"].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => setActiveNav(section)}
                className={`capitalize transition hover:text-blue-500 ${activeNav === section ? "text-blue-500 font-bold" : ""}`}
              >
                {section === "work" ? "Show Work" : section}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#38434f]"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* ROUTER LINKS TO LOGIN & REGISTER */}
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold transition hover:text-blue-500"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]"
            >
              Join SkilledLink
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)]"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)]"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <aside className={`mobile-drawer fixed bottom-0 right-0 top-0 z-50 w-[min(85vw,360px)] p-7 shadow-2xl lg:hidden ${menuOpen ? "is-open" : ""}`}>
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-blue-500 font-bold">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-2xl">&times;</button>
          </div>
          <nav className="mt-8 flex flex-col gap-6 text-lg font-medium">
            {["trades", "professionals", "work", "pricing", "testimonials", "faq", "contact"].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => { setActiveNav(section); setMenuOpen(false); }}
                className="capitalize hover:text-blue-500"
              >
                {section}
              </a>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-full border border-[var(--border-color)] py-3 text-center font-bold"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-full bg-[#2563EB] py-3 text-center font-bold text-white"
            >
              Join SkilledLink
            </Link>
          </div>
        </aside>
      </header>

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2200&q=90" alt="Building site" className="hero-image h-full w-full object-cover" />
          <div className={`absolute inset-0 ${theme === "light" ? "bg-white/40" : "bg-black/60"}`} />
          <div className={`absolute inset-0 ${theme === "light" ? "bg-gradient-to-t from-white via-white/20 to-transparent" : "bg-gradient-to-t from-[#1d2226] via-[#1d2226]/40 to-transparent"}`} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-12 pt-36 md:px-10 md:pb-16 md:pt-40">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-600">
                Connecting people with skilled hands.
              </div>
              <h1 className="max-w-5xl text-[14vw] font-bold leading-[0.88] tracking-[-0.05em] sm:text-[15vw] md:text-[10vw] lg:text-[8vw]">
                Find the <span className="serif italic font-normal">skill.</span>
              </h1>
              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end">
                <p className="max-w-md text-base leading-7 md:text-lg">Discover people who know how to build, repair, create and make things happen.</p>
                <a href="#trades" className="magnetic-button inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#2563EB] px-6 py-4 text-sm font-bold text-white shadow-lg sm:w-fit">
                  Start exploring <ArrowDown size={17} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRADES MARQUEE SECTION */}
      <section id="trades" className="overflow-hidden py-20 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <div ref={addRevealRef} className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Explore Directory</p>
              <h2 className="mt-4 text-4xl font-bold">Every trade has a <span className="serif italic font-normal opacity-70">story.</span></h2>
            </div>
            <p className="max-w-sm leading-7">Browse the people who build, repair and shape everyday life in your community.</p>
          </div>
        </div>
        <div className="mt-10 overflow-hidden border-y border-[var(--border-color)] py-5">
          <div className="trade-marquee flex w-max gap-5">
            {[...tradeCards, ...tradeCards].map((trade, index) => (
              <a href="#professionals" key={`${trade.name}-${index}`} className="group relative h-72 w-60 shrink-0 overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <img src={trade.image} alt={trade.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 text-xl font-bold text-white">{trade.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONALS SECTION */}
      <section id="professionals" className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[.7fr_1.3fr]">
          <div ref={addRevealRef} className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Professionals</p>
            <h2 className="mt-4 text-5xl font-bold">Meet the people <span className="serif block italic font-normal opacity-70">behind the work.</span></h2>
            <p className="mt-6 leading-7">Profiles built around experience, completed work and reputation — not just a name and a phone number.</p>
            <button className="magnetic-button mt-8 flex items-center gap-3 rounded-full border border-blue-500 bg-[#2563EB] px-6 py-4 text-sm font-bold text-white hover:bg-blue-700">
              Explore professionals <ArrowRight size={17} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {professionals.map((pro, index) => (
              <div key={pro.name} ref={addRevealRef} className={`reveal image-wrap relative overflow-hidden rounded-2xl border border-[var(--border-color)] ${index === 0 ? "sm:row-span-2" : ""}`}>
                <img src={pro.image} alt={pro.name} className="h-[300px] sm:h-full w-full object-cover" />
                <div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/70 p-4 text-white backdrop-blur-md">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold">{pro.name}</p>
                      <p className="text-xs text-slate-300">{pro.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold"><Star size={13} className="fill-yellow-400 text-yellow-400" />{pro.rating}</div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-300"><MapPin size={12} />{pro.location} <CheckCircle2 size={12} className="ml-2 text-green-400" /> Verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="border-t border-[var(--border-color)] bg-[var(--card-bg)] py-20">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <div ref={addRevealRef} className="reveal grid gap-8 md:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Local Pricing</p>
              <p className="mt-4 text-sm">Built for Cameroon with local market context.</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold">Clear numbers. <span className="serif italic font-normal text-blue-600">No dollar signs.</span></h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pricingExamples.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-nav)] p-5">
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="mt-3 text-xl font-bold text-blue-600">{item.amount}</p>
                    <p className="mt-1 text-xs">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOW WORK SECTION */}
      <section id="work" className="py-24 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <div ref={addRevealRef} className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Proof of Work</p>
            <h2 className="mt-4 text-5xl font-bold">Don't just say <span className="serif italic font-normal opacity-70">you can.</span> Show it.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {workImages.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <img src={img} alt="Work preview" className="h-64 w-full object-cover transition hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="border-t border-[var(--border-color)] bg-[var(--card-bg)] py-20">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <div ref={addRevealRef} className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600">Community Reviews</p>
            <h2 className="mt-4 text-4xl font-bold">People sharing <span className="serif italic font-normal opacity-70">their experience.</span></h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-nav)] p-6">
                <p className="text-sm italic">"{t.quote}"</p>
                <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-[1000px] px-5">
          <h2 className="text-4xl font-bold text-center">Frequently Asked <span className="serif italic font-normal text-blue-600">Questions</span></h2>
          <div className="mt-10 flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between text-left font-semibold"
                >
                  {faq.question}
                  <span>{openFaq === index ? "-" : "+"}</span>
                </button>
                {openFaq === index && <p className="mt-3 text-sm leading-relaxed">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="border-t border-[var(--border-color)] bg-[var(--card-bg)] py-20">
        <div className="mx-auto max-w-[800px] px-5">
          <h2 className="text-4xl font-bold text-center">Get in <span className="serif italic font-normal text-blue-600">Touch</span></h2>
          <form onSubmit={handleContactSubmit} className="mt-8 flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-nav)] p-3 outline-none"
            />
            <input
              type="email"
              required
              placeholder="Your Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-nav)] p-3 outline-none"
            />
            <textarea
              required
              rows={4}
              placeholder="Your Message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-nav)] p-3 outline-none"
            />
            <button
              type="submit"
              disabled={contactStatus === "sending"}
              className="rounded-lg bg-[#2563EB] py-3 font-bold text-white transition hover:bg-blue-700"
            >
              {contactStatus === "sending" ? "Sending..." : "Send Message"}
            </button>
            {contactStatus === "sent" && <p className="text-center text-sm font-semibold text-green-500">Message sent successfully!</p>}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-color)] py-8 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} SkilledLink. All rights reserved.</p>
      </footer>
    </div>
  );
}