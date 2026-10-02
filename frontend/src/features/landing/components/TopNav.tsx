// src/features/landing/components/TopNav.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";

/* ─────────────────────── nav items ─────────────────────── */

const navItems = [
  { id: "trades", label: "Browse trades" },
  { id: "professionals", label: "Professionals" },
  { id: "need-work", label: "Why SkilledLink" },
  { id: "contact", label: "Contact" },
];

/* ═══════════════════════════════════════════════════════════
   THEME HELPERS
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

const NAV_HEIGHT = 72;

const TopNav: React.FC = () => {
  const navigate = useNavigate();

  const auth = useAuth() as any;
  const currentUser = auth?.currentUser ?? auth?.user ?? null;
  const logout: undefined | (() => void | Promise<void>) = auth?.logout;
  const isAuthenticated = !!currentUser;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [currentSection, setCurrentSection] = useState("home");

  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ─── THEME ─── */
  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

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

  /* ─── DETECT WHEN WE'VE SCROLLED PAST THE HERO ─── */
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("home");
      if (!hero) {
        // No hero on this page — nav is solid by default
        setSolid(true);
        return;
      }
      const rect = hero.getBoundingClientRect();
      // Switch to solid as soon as the bottom of the hero is near the top
      setSolid(rect.bottom <= NAV_HEIGHT + 24);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── ACTIVE SECTION ─── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let active = "home";

      ["home", "trades", "professionals", "need-work", "faq", "contact"].forEach(
        (id) => {
          const section = document.getElementById(id);
          if (section) {
            const top = section.getBoundingClientRect().top + window.scrollY;
            if (scrollPosition >= top) active = id;
          }
        }
      );

      setCurrentSection(active);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── SCROLL LOCK + ESCAPE ─── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };

    if (mobileOpen || userMenuOpen) {
      window.addEventListener("keydown", onKey);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, userMenuOpen]);

  /* ─── OUTSIDE CLICK CLOSES USER MENU ─── */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* ─── NAVIGATION ─── */
  const handleNavigate = (id: string) => {
    setCurrentSection(id);
    setMobileOpen(false);

    if (id === "home") {
      if (window.location.pathname !== "/") navigate("/");
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (window.location.pathname === "/") {
      const section = document.getElementById(id);
      if (section) {
        const top =
          section.getBoundingClientRect().top +
          window.scrollY -
          (NAV_HEIGHT + 12);
        window.scrollTo({ top, behavior: "smooth" });
      }
      return;
    }

    navigate(`/#${id}`);
  };

  const handleLogin = () => {
    setMobileOpen(false);
    navigate("/login");
  };

  const handleGetStarted = () => {
    setMobileOpen(false);
    navigate("/register");
  };

  const handleGoHome = () => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate("/home");
  };

  const handleProfile = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/home/profile");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    try {
      if (typeof logout === "function") await logout();
    } catch {
      /* ignore */
    }
    navigate("/");
  };

  const displayName =
    currentUser?.first_name || currentUser?.firstName || "Account";
  const displayEmail = currentUser?.email || "";
  const initials =
    (currentUser?.first_name?.[0] || currentUser?.firstName?.[0] || "U") +
    (currentUser?.last_name?.[0] || currentUser?.lastName?.[0] || "");

  /* ─── Conditional class helpers ─── */
  // When NOT solid (over hero): white text, transparent background
  // When solid: theme-aware slate text, glass background
  const logoBase = solid
    ? "text-slate-900 dark:text-white"
    : "text-white";
  const logoAccent = solid
    ? "text-blue-600 dark:text-blue-400"
    : "text-blue-400";

  const navItemBase = solid
    ? "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    : "text-white/75 hover:text-white";
  const navItemActive = solid
    ? "text-blue-700 dark:text-blue-300"
    : "text-white";
  const navUnderline = solid
    ? "bg-blue-600 dark:bg-blue-400"
    : "bg-blue-400";

  const iconBtnBase = solid
    ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    : "text-white/80 hover:bg-white/10 hover:text-white";

  const signInBtn = solid
    ? "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    : "text-white/85 hover:text-white";

  const primaryBtn = solid
    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
    : "bg-white text-slate-900 hover:bg-slate-100 shadow-md shadow-black/20";

  return (
    <>
      {/* ═══════════════════════════════════════════
          MASTHEAD
      ═══════════════════════════════════════════ */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          solid
            ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85"
            : "border-b border-transparent bg-transparent"
        }`}
        style={{ height: NAV_HEIGHT }}
      >
        <nav className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* LEFT — WORDMARK */}
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="group shrink-0"
            aria-label="SkilledLink home"
          >
            <div className="text-[20px] font-bold tracking-tight sm:text-[22px]">
              <span className={logoBase}>Skilled</span>
              <span className={logoAccent}>Link</span>
            </div>
          </button>

          {/* CENTER — NAV ITEMS (desktop) */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-200 ${
                      isActive ? navItemActive : navItemBase
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full ${navUnderline}`}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — AUTH CTAs (desktop) */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${iconBtnBase}`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              /* ── Signed-in: avatar dropdown ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-all ${
                    solid
                      ? "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                      : "border-white/20 bg-white/10 backdrop-blur-md hover:border-white/30 hover:bg-white/20"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold uppercase text-white">
                    {initials}
                  </span>
                  <span
                    className={`max-w-[100px] truncate text-[13px] font-semibold ${
                      solid
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-white"
                    }`}
                  >
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      solid ? "text-slate-400" : "text-white/70"
                    } ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
                  >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </p>
                      {displayEmail && (
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {displayEmail}
                        </p>
                      )}
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleGoHome}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard
                          size={15}
                          className="text-slate-400"
                        />
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={handleProfile}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <User size={15} className="text-slate-400" />
                        My profile
                      </button>
                    </div>

                    <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut size={15} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Signed-out: Sign in + Get started ── */
              <>
                <button
                  type="button"
                  onClick={handleLogin}
                  className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${signInBtn}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-all active:scale-[0.98] ${primaryBtn}`}
                >
                  Get started free
                </button>
              </>
            )}
          </div>

          {/* MOBILE */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${iconBtnBase}`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={handleGetStarted}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-all active:scale-[0.98] ${primaryBtn}`}
              >
                Sign up
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${iconBtnBase}`}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE MENU (full-screen drawer)
      ═══════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-40 flex flex-col bg-[#f8fafc] lg:hidden dark:bg-slate-950"
        >
          <div className="shrink-0" style={{ height: NAV_HEIGHT }} />

          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
            {isAuthenticated && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[13px] font-bold uppercase text-white">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-lg font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto space-y-2.5 pt-8">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    <LayoutDashboard size={16} />
                    Go to dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User size={16} />
                    My profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    Get started free
                  </button>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Sign in
                  </button>
                </>
              )}

              <p className="pt-4 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
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