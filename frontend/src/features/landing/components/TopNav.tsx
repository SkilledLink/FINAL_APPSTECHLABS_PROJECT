// src/features/landing/components/TopNav.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  activeNav?: string;
  onNavigate?: (id: string) => void;
}

/* Reduced to three primary sections */
const navItems = [
  { id: "trades", label: "Trades" },
  { id: "professionals", label: "Professionals" },
  { id: "contact", label: "Contact" },
];

/* ═══════════════════════════════════════════════════════════
   THEME HELPERS — kept exported for compatibility
═══════════════════════════════════════════════════════════ */

export const THEME_KEY = "theme";

export function getInitialTheme(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    /* ignore */
  }

  if (document.documentElement.classList.contains("dark")) return true;

  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return true;
    }
  } catch {
    /* ignore */
  }

  return false;
}

export function applyTheme(isDark: boolean) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");

  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

/* ═══════════════════════════════════════════════════════════ */

const TopNav: React.FC<NavbarProps> = ({ activeNav, onNavigate }) => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(
    activeNav || "home"
  );
  const [visible, setVisible] = useState(false);

  /* ─── REVEAL AFTER HERO ─── */
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── ACTIVE SECTION ─── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let activeSection = "home";

      const allSections = [
        "home",
        "trades",
        "professionals",
        "need-work",
        "faq",
        "contact",
      ];

      allSections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const sectionTop =
            section.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= sectionTop) {
            activeSection = id;
          }
        }
      });

      setCurrentSection(activeSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── SCROLL LOCK + ESCAPE ─── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    if (mobileOpen) {
      window.addEventListener("keydown", onKey);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  /* ─── NAVIGATION ─── */
  const handleNavigate = (id: string) => {
    setCurrentSection(id);
    onNavigate?.(id);

    if (id === "home") {
      if (window.location.pathname !== "/") {
        navigate("/");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMobileOpen(false);
      return;
    }

    if (window.location.pathname === "/") {
      const section = document.getElementById(id);
      if (section) {
        const navbarHeight = 80;
        const sectionTop =
          section.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: sectionTop, behavior: "smooth" });
      }
      setMobileOpen(false);
      return;
    }

    navigate(`/#${id}`);
    setMobileOpen(false);
  };

  const handleGetStarted = () => {
    setMobileOpen(false);
    navigate("/register");
  };

  const handleLogin = () => {
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* ═══════════════════════════════════════════
          MASTHEAD
          Layout: [SkilledLink]  [Nav items]  [Login · Get started]
      ═══════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-[#f8fafc] transition-transform duration-500 ease-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className=" flex h-16 w-full items-center justify-between px-6 sm:h-20 sm:px-10 lg:px-16">
          {/* LEFT — WORDMARK */}
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="transition-opacity duration-200 hover:opacity-90"
          >
            <div className="text-[22px] font-bold tracking-tight sm:text-[26px]">
              <span className="text-slate-900 dark:text-white">Skilled</span>
              <span className="text-blue-500">Link</span>
            </div>
          </button>

          {/* CENTER — NAV ITEMS (desktop only) */}
          <ul className="hidden items-baseline gap-8 lg:flex">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`relative pb-1 text-[12px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-blue-600"
                    }`}
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-0.5 left-0 right-0 h-px origin-left bg-blue-600 transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — LOGIN + GET STARTED (desktop) */}
          <div className="hidden items-baseline gap-8 lg:flex">
            <button
              type="button"
              onClick={handleLogin}
              className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleGetStarted}
              className="bg-blue-600 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Get started
            </button>
          </div>

          {/* MOBILE RIGHT — Join button (stands in for the desktop cluster) */}
          <div className="flex items-center gap-6 lg:hidden">
            <button
              type="button"
              onClick={handleGetStarted}
              className="bg-blue-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Join
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="text-[12px] font-bold uppercase tracking-[0.22em] text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE MENU
      ═══════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-40 bg-[#f8fafc] lg:hidden"
        >
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-6 pt-24 sm:px-10 sm:pt-28">
            {/* NAV LIST */}
            <ul className="flex-1">
              {navItems.map((item, i) => {
                const isActive = currentSection === item.id;

                return (
                  <li
                    key={item.id}
                    className="border-t border-slate-200 last:border-b"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className="flex w-full items-baseline justify-between gap-6 py-5 text-left"
                    >
                      <span className="flex items-baseline gap-5">
                        <span
                          className={`text-[12px] font-bold tabular-nums transition-colors duration-200 ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`text-[clamp(1.5rem,5vw,2rem)] font-bold leading-tight tracking-[-0.03em] transition-colors duration-200 ${
                            isActive
                              ? "text-blue-600"
                              : "text-blue-600/70 hover:text-blue-600"
                          }`}
                          style={{
                            fontFamily: '"Fraunces", Georgia, serif',
                          }}
                        >
                          {item.label}
                        </span>
                      </span>

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-blue-600"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ACTIONS */}
            <div className="border-t border-slate-200 py-8">
              <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-[13px] font-bold uppercase tracking-[0.22em] text-blue-600 transition-colors duration-200 hover:text-blue-700"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="bg-blue-600 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  Get started
                </button>
              </div>

              <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                SkilledLink · Cameroon
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNav;