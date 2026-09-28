// src/features/landing/components/TopNav.tsx

import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import LogoLight from "../../../assets/LogoLight.png";
import LogoDark from "../../../assets/LogoDark.png";

interface NavbarProps {
  activeNav?: string;
  onNavigate?: (id: string) => void;
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "trades", label: "Trades" },
  { id: "professionals", label: "Professionals" },
  { id: "need-work", label: "Need Work" },
  { id: "reviews", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

/* ═══════════════════════════════════════════════════════════
   THEME HELPERS — central source of truth, usable anywhere
   (import these in ThemeProvider, other components, etc.)
═══════════════════════════════════════════════════════════ */

export const THEME_KEY = "theme";

export function getInitialTheme(): boolean {
  if (typeof document === "undefined") return false;

  // 1. Explicit user preference wins
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    /* ignore */
  }

  // 2. DOM (set by the <head> script)
  if (document.documentElement.classList.contains("dark")) return true;

  // 3. System preference
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
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

/* ═══════════════════════════════════════════════════════════ */

const TopNav: React.FC<NavbarProps> = ({
  activeNav,
  onNavigate,
}) => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(
    activeNav || "home"
  );
  const [isScrolled, setIsScrolled] = useState(false);

  /* ─── THEME STATE ─── */
  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme());

  /* Apply theme whenever it changes */
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  /* Stay in sync if another component toggles the theme */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const domDark = document.documentElement.classList.contains("dark");
      setIsDark((prev) => (prev === domDark ? prev : domDark));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  /* ─── SCROLL STATE ─── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── ACTIVE SECTION DETECTION ─── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let activeSection = "home";

      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) {
          const sectionTop =
            section.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= sectionTop) {
            activeSection = item.id;
          }
        }
      });

      setCurrentSection(activeSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── SCROLL LOCK (mobile) ─── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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
        const navbarHeight = 100;
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
      {/* =========================================================
          MAIN NAVBAR
      ========================================================== */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          px-3 sm:px-5 lg:px-8
          transition-all duration-500
        "
      >
        <nav
          className={`
            mx-auto max-w-[1440px]
            mt-3 sm:mt-4
            h-[68px] sm:h-[72px]
            rounded-2xl sm:rounded-[20px]
            flex items-center justify-between
            px-3 sm:px-5 lg:px-6
            transition-all duration-500

            ${
              isScrolled
                ? `
                  bg-white/85 dark:bg-surface/85
                  backdrop-blur-2xl
                  border border-slate-200/80 dark:border-border-subtle
                  shadow-[0_18px_50px_rgba(15,23,42,0.10)]
                  dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)]
                `
                : `
                  bg-white/45 dark:bg-surface/30
                  backdrop-blur-xl
                  border border-white/50 dark:border-white/[0.06]
                  shadow-[0_10px_40px_rgba(15,23,42,0.04)]
                `
            }
          `}
        >
          {/* ─────────── LOGO ─────────── */}
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="group relative shrink-0 flex items-center cursor-pointer outline-none"
            aria-label="SkilledLink home"
          >
            <img
              src={isDark ? LogoDark : LogoLight}
              alt="SkilledLink"
              className="
                h-[52px] w-[112px]
                sm:h-[58px] sm:w-[124px]
                object-contain
                transition-all duration-300
                group-hover:scale-[1.03]
              "
            />
            <span
              className="
                absolute left-1/2 -bottom-1
                -translate-x-1/2
                w-10 h-1 rounded-full
                bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600
                opacity-0 group-hover:opacity-70
                blur-sm transition-opacity duration-300
              "
            />
          </button>

          {/* ─────────── DESKTOP NAV ─────────── */}
          <div className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    relative px-3.5 py-2.5 rounded-xl
                    text-[13px] font-semibold tracking-[-0.01em]
                    transition-all duration-300
                    ${
                      isActive
                        ? "text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-cyan-400/[0.08]"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.05]"
                    }
                  `}
                >
                  {item.label}
                  <span
                    className={`
                      absolute left-1/2 -translate-x-1/2 bottom-[3px]
                      h-[2px] rounded-full
                      bg-gradient-to-r from-blue-600 to-cyan-400
                      transition-all duration-300
                      ${isActive ? "w-5 opacity-100" : "w-0 opacity-0"}
                    `}
                  />
                </button>
              );
            })}
          </div>

          {/* ─────────── DESKTOP ACTIONS ─────────── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="
                group relative
                flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-slate-100/70 dark:bg-white/[0.05]
                border border-slate-200/70 dark:border-border-subtle
                text-slate-600 dark:text-slate-300
                hover:text-blue-600 dark:hover:text-cyan-400
                hover:border-blue-300/70 dark:hover:border-cyan-400/30
                hover:bg-blue-50/70 dark:hover:bg-cyan-400/[0.06]
                transition-all duration-300 cursor-pointer
              "
            >
              <span className="transition-transform duration-500 group-hover:rotate-[20deg]">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </span>
            </button>

            {/* Login */}
            <button
              type="button"
              onClick={handleLogin}
              className="
                group flex items-center gap-1.5
                px-3.5 py-2.5 rounded-xl
                text-[13px] font-semibold
                text-slate-600 dark:text-slate-300
                hover:text-slate-950 dark:hover:text-white
                transition-all duration-300
              "
            >
              <span>Login</span>
              <ChevronDown
                size={13}
                className="
                  rotate-[-90deg] opacity-40
                  group-hover:translate-x-0.5 group-hover:opacity-100
                  transition-all
                "
              />
            </button>

            <div className="h-7 w-px bg-slate-200 dark:bg-border-subtle mx-1" />

            {/* Get Started */}
            <button
              type="button"
              onClick={handleGetStarted}
              className="
                group relative
                flex items-center gap-2 overflow-hidden
                rounded-xl
                bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500
                px-5 py-2.5
                text-[13px] font-bold text-white
                shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)]
                active:translate-y-0
              "
            >
              <span
                className="
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  group-hover:translate-x-full
                  transition-transform duration-700
                "
              />
              <span className="relative z-10">Get Started</span>
              <ArrowRight
                size={15}
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* ─────────── MOBILE ACTIONS ─────────── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="
                group relative
                flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-slate-100/70 dark:bg-white/[0.05]
                border border-slate-200/70 dark:border-border-subtle
                text-slate-600 dark:text-slate-300
                hover:text-blue-600 dark:hover:text-cyan-400
                transition-all duration-300 cursor-pointer
              "
            >
              <span className="transition-transform duration-500 group-hover:rotate-[20deg]">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="
                relative flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-slate-100/70 dark:bg-white/[0.06]
                border border-slate-200/70 dark:border-border-subtle
                text-slate-700 dark:text-slate-200
                hover:text-blue-600 dark:hover:text-cyan-400
                hover:border-blue-300 dark:hover:border-cyan-400/30
                transition-all duration-300 cursor-pointer
              "
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================
          MOBILE MENU
      ========================================================== */}
      {mobileOpen && (
        <>
          <div
            className="
              fixed inset-0 z-40
              bg-slate-950/30 dark:bg-black/60
              backdrop-blur-sm lg:hidden
            "
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="
              fixed top-[92px] left-3 right-3 z-50
              max-h-[calc(100vh-108px)] overflow-y-auto
              rounded-[22px]
              bg-white/95 dark:bg-surface/95
              backdrop-blur-2xl
              border border-slate-200/80 dark:border-border-subtle
              shadow-[0_25px_80px_rgba(15,23,42,0.18)]
              dark:shadow-[0_25px_80px_rgba(0,0,0,0.60)]
              p-3 lg:hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 mb-2 border-b border-slate-100 dark:border-border-subtle">
              <img
                src={isDark ? LogoDark : LogoLight}
                alt="SkilledLink"
                className="h-12 w-24 object-contain"
              />
              <span
                className="
                  rounded-full
                  bg-blue-50 dark:bg-cyan-400/[0.08]
                  px-2.5 py-1
                  text-[10px] font-bold uppercase tracking-wider
                  text-blue-600 dark:text-cyan-400
                  border border-blue-100 dark:border-cyan-400/20
                "
              >
                Connect • Hire • Grow
              </span>
            </div>

            {/* Nav */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      group w-full flex items-center justify-between
                      rounded-xl px-4 py-3.5 text-left
                      text-sm font-semibold transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-50 dark:bg-cyan-400/[0.08] text-blue-600 dark:text-cyan-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-950 dark:hover:text-white"
                      }
                    `}
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      size={15}
                      className={`
                        transition-all duration-200
                        ${
                          isActive
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                        }
                      `}
                    />
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-border-subtle space-y-2">
              {/* Theme switch row */}
              <button
                type="button"
                onClick={toggleTheme}
                className="
                  w-full flex items-center justify-between
                  rounded-xl px-4 py-3
                  text-sm font-semibold
                  text-slate-700 dark:text-slate-200
                  hover:bg-slate-50 dark:hover:bg-white/[0.04]
                  transition-colors
                "
              >
                <span className="flex items-center gap-2.5">
                  {isDark ? (
                    <Sun size={16} className="text-cyan-400" />
                  ) : (
                    <Moon size={16} className="text-blue-600" />
                  )}
                  <span>{isDark ? "Light mode" : "Dark mode"}</span>
                </span>
                <span
                  className={`
                    relative inline-flex h-5 w-9 items-center rounded-full
                    transition-colors duration-300
                    ${isDark ? "bg-cyan-400/30" : "bg-slate-200"}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 h-4 w-4 rounded-full
                      bg-white dark:bg-cyan-400 shadow-sm
                      transition-transform duration-300
                      ${isDark ? "translate-x-[18px]" : "translate-x-0.5"}
                    `}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogin}
                className="
                  w-full rounded-xl px-4 py-3.5 text-left
                  text-sm font-semibold
                  text-slate-700 dark:text-slate-200
                  hover:bg-slate-50 dark:hover:bg-white/[0.04]
                  transition-colors
                "
              >
                Already have an account?{" "}
                <span className="text-blue-600 dark:text-cyan-400">Login</span>
              </button>

              <button
                type="button"
                onClick={handleGetStarted}
                className="
                  group w-full flex items-center justify-center gap-2
                  rounded-xl
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  px-5 py-3.5
                  text-sm font-bold text-white
                  shadow-lg shadow-blue-600/20
                  transition-all duration-300
                  hover:shadow-xl hover:shadow-blue-600/25
                "
              >
                <span>Get Started</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 px-3 pb-2 flex items-center justify-center gap-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
              <span>Professional Service Network</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TopNav;