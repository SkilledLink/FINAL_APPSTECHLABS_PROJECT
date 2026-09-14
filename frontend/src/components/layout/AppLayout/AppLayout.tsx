// src/components/layout/AppLayout/AppLayout.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MobileNavigation from '../MobileNavigation/MobileNavigation';

export default function AppLayout() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      document.documentElement.classList.toggle('dark', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  /* Stable background nodes */
  const networkNodes = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: (i * 28) % 88 + 6,
      y: (i * 34) % 84 + 8,
      size: Math.random() * 1.5 + 2,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 3,
    }));
  }, []);

  const activeLinks = useMemo(() => {
    return [
      { x1: 12, y1: 25, x2: 38, y2: 60, duration: 9, delay: 0 },
      { x1: 38, y1: 60, x2: 75, y2: 28, duration: 11, delay: 1.2 },
      { x1: 75, y1: 28, x2: 88, y2: 72, duration: 10, delay: 2.1 },
      { x1: 22, y1: 78, x2: 52, y2: 35, duration: 12, delay: 1.5 },
    ];
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f8fafc] font-sans text-slate-900 transition-colors duration-300 selection:bg-blue-500 selection:text-white dark:bg-[#060913] dark:text-slate-100">
      {/* ═══════════ Dark mode ambience ═══════════ */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            {/* Only blue — no cyan */}
            <div className="absolute left-1/4 top-0 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[140px]" />
            <div className="absolute bottom-0 right-1/4 h-[35rem] w-[35rem] rounded-full bg-blue-500/10 blur-[140px]" />

            {/* Alignment grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3341550a_1px,transparent_1px),linear-gradient(to_bottom,#3341550a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />

            {/* Connection vectors — blue only */}
            <svg className="absolute inset-0 h-full w-full opacity-35">
              <defs>
                <linearGradient
                  id="prodStreamGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {activeLinks.map((link, idx) => (
                <g key={`prod-bridge-${idx}`}>
                  <motion.line
                    x1={`${link.x1}%`}
                    y1={`${link.y1}%`}
                    x2={`${link.x2}%`}
                    y2={`${link.y2}%`}
                    stroke="url(#prodStreamGradient)"
                    strokeWidth="0.75"
                    strokeDasharray="4 6"
                    initial={{ pathLength: 0.2, opacity: 0.2 }}
                    animate={{
                      pathLength: [0.3, 0.8, 0.3],
                      opacity: [0.15, 0.45, 0.15],
                    }}
                    transition={{
                      duration: link.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: link.delay,
                    }}
                  />
                  <motion.circle
                    r="2"
                    fill="#60a5fa"
                    animate={{
                      cx: [`${link.x1}%`, `${link.x2}%`],
                      cy: [`${link.y1}%`, `${link.y2}%`],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: link.duration * 0.75,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: link.delay,
                    }}
                  />
                </g>
              ))}

              {networkNodes.map((node) => (
                <motion.circle
                  key={`prod-node-${node.id}`}
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.size}
                  fill="#3b82f6"
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [0.9, 1.2, 0.9],
                  }}
                  transition={{
                    duration: node.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: node.delay,
                  }}
                />
              ))}
            </svg>

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(6,9,19,0.85)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Light mode ambience (blue only) ═══════════ */}
      {!isDark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -left-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute -right-32 bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-blue-500/5 blur-3xl" />
        </div>
      )}

      {/* ═══════════ Fixed top header ═══════════ */}
      <header className="z-40 w-full shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#060913]/90">
        <Header isDark={isDark} toggleTheme={toggleTheme} />
      </header>

      {/* ═══════════ Body: sidebar + outlet ═══════════ */}
      <div className="relative z-10 flex min-h-0 w-full flex-1 overflow-hidden">
        {/* Sidebar wrapper — NO border, Sidebar component has its own */}
        <aside
          aria-label="Sidebar Navigation"
          className="relative z-20 hidden h-full shrink-0 md:flex"
        >
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        </aside>

        {/* Outlet — NO padding, pages own their spacing */}
        <main
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:pb-0"
        >
          <Outlet />
        </main>
      </div>

      {/* ═══════════ Mobile bottom nav ═══════════ */}
      <nav
        aria-label="Mobile Navigation"
        className="z-40 shrink-0 border-t border-slate-200/80 bg-white/90 backdrop-blur-md md:hidden dark:border-slate-800/80 dark:bg-[#060913]/90"
      >
        <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
      </nav>
    </div>
  );
}