// src/features/landing/components/TopNav.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';

const navItems = [
  { id: 'professionals', label: 'Find a professional' },
  { id: 'how', label: 'How it works' },
  { id: 'for-professionals', label: 'For professionals' },
];

export const THEME_KEY = 'theme';

export function getInitialTheme(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    /* ignore */
  }
  if (document.documentElement.classList.contains('dark')) return true;
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function applyTheme(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch {
    /* ignore */
  }
}

/* Floating pill offset (top) + pill height = scroll anchor */
const NAV_OFFSET = 12;
const NAV_HEIGHT = 60;
const SCROLL_ANCHOR = NAV_OFFSET + NAV_HEIGHT + 16;

const ease = [0.22, 1, 0.36, 1] as const;

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const currentUser = auth?.currentUser ?? auth?.user ?? null;
  const logout: undefined | (() => void | Promise<void>) = auth?.logout;
  const isAuthenticated = !!currentUser;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const domDark = document.documentElement.classList.contains('dark');
      setIsDark((prev) => (prev === domDark ? prev : domDark));
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => setIsDark((p) => !p);

  /* Scroll state */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      const pos = window.scrollY + 160;
      let active = 'home';
      ['professionals', 'how', 'for-professionals'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && pos >= el.getBoundingClientRect().top + window.scrollY) {
          active = id;
        }
      });
      setActiveSection(active);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Body lock + Escape */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    if (mobileOpen || userMenuOpen) {
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, userMenuOpen]);

  /* Outside click closes user menu */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  /* Navigation */
  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (window.location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const top =
        el.getBoundingClientRect().top + window.scrollY - SCROLL_ANCHOR;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    setMobileOpen(false);
    navigate('/login');
  };
  const handleGetStarted = () => {
    setMobileOpen(false);
    navigate('/register');
  };
  const handleDashboard = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/home');
  };
  const handleProfile = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/home/profile');
  };
  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    try {
      if (typeof logout === 'function') await logout();
    } catch {
      /* ignore */
    }
    navigate('/');
  };

  const displayName =
    currentUser?.first_name || currentUser?.firstName || 'Account';
  const displayEmail = currentUser?.email || '';
  const initials =
    (currentUser?.first_name?.[0] || currentUser?.firstName?.[0] || 'U') +
    (currentUser?.last_name?.[0] || currentUser?.lastName?.[0] || '');

  return (
    <>
      {/* ── Floating nav wrapper ──────────────────── */}
      <div
        className="fixed left-0 right-0 z-50 px-3 sm:px-6"
        style={{ top: NAV_OFFSET }}
      >
        <motion.nav
          initial={false}
          animate={{
            backgroundColor: scrolled
              ? isDark
                ? 'rgba(1, 28, 68, 0.78)'
                : 'rgba(255, 255, 255, 0.82)'
              : isDark
                ? 'rgba(1, 28, 68, 0.28)'
                : 'rgba(255, 255, 255, 0.34)',
            borderColor: scrolled
              ? isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(226, 232, 240, 0.85)'
              : isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(226, 232, 240, 0.45)',
            boxShadow: scrolled
              ? isDark
                ? '0 20px 50px -18px rgba(0, 0, 0, 0.7)'
                : '0 18px 46px -18px rgba(15, 23, 42, 0.18)'
              : '0 8px 24px -14px rgba(15, 23, 42, 0.10)',
          }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto flex w-full max-w-[1180px] items-center gap-2 rounded-full border px-3 backdrop-blur-xl"
          style={{ height: NAV_HEIGHT, WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Wordmark — text only, nothing else */}
          <button
            type="button"
            onClick={() => scrollTo('home')}
            aria-label="SkilledLink home"
            className="shrink-0 rounded-full px-2 py-1.5 text-[17px] font-bold tracking-tight transition-opacity duration-200 hover:opacity-80 sm:text-[18px]"
          >
            <span className="text-[#06142e] dark:text-white">Skilled</span>
            <span className="text-[#2563EB] dark:text-[#4F8EFF]">Link</span>
          </button>

          {/* Center nav — desktop */}
          <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className="relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="topnav-active"
                        className="absolute inset-0 rounded-full bg-slate-100/90 dark:bg-white/[0.09]"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        isActive
                          ? 'text-[#06142e] dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right actions — desktop */}
          <div className="ml-auto hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <Sun size={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <Moon size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 py-1 pl-1 pr-2.5 backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white dark:border-white/[0.10] dark:bg-white/[0.05] dark:hover:border-white/[0.18] dark:hover:bg-white/[0.09]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-[11px] font-bold uppercase text-white">
                    {initials}
                  </span>
                  <span className="max-w-[110px] truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform dark:text-slate-500 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease }}
                      className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-white/[0.08] dark:bg-[#01306e] dark:shadow-black/40"
                    >
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
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
                          onClick={handleDashboard}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.05]"
                        >
                          <LayoutDashboard size={15} className="text-slate-400" />
                          Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={handleProfile}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.05]"
                        >
                          <User size={15} className="text-slate-400" />
                          My profile
                        </button>
                      </div>
                      <div className="border-t border-slate-100 p-1.5 dark:border-white/[0.06]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          <LogOut size={15} />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-blue-600/25 transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#1d4ed8] hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] active:translate-y-0 active:scale-[0.98] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                >
                  Get started
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </>
            )}
          </div>

          {/* Right actions — mobile */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* ── Mobile drawer ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="fixed inset-0 z-40 flex flex-col bg-[#fafafa] lg:hidden dark:bg-[#011c44]"
          >
            <div
              className="shrink-0"
              style={{ height: NAV_OFFSET + NAV_HEIGHT + 12 }}
            />
            <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8">
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease }}
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-[13px] font-bold uppercase text-white">
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
                </motion.div>
              )}

              <ul className="space-y-1">
                {navItems.map((item, i) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.08 + i * 0.06,
                        ease,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => scrollTo(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-lg font-semibold transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-[#2563EB] dark:bg-blue-500/10 dark:text-[#4F8EFF]'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#4F8EFF]" />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-2.5 pt-8">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDashboard}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleProfile}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200"
                    >
                      <User size={16} />
                      My profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
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
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                    >
                      Get started
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogin}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;