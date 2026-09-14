import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavigation from "../MobileNavigation/MobileNavigation";

export default function AppLayout() {
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      document.documentElement.classList.toggle("dark", nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Stable, performance-optimized nodes representing professional connections & data mapping
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
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden relative selection:bg-cyan-500 selection:text-white">
      
      {/* Production-Grade Intentional Dark Mode Environment Layer */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Restrained, Non-Distracting Atmospheric Depth Gradients */}
            <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-cyan-600/10 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[140px]" />

            {/* Subtle, Professional Alignment Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3341550a_1px,transparent_1px),linear-gradient(to_bottom,#3341550a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />

            {/* Purposeful, Clean Connection Vectors */}
            <svg className="absolute inset-0 w-full h-full opacity-35">
              <defs>
                <linearGradient id="prodStreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
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
                      ease: "easeInOut",
                      delay: link.delay,
                    }}
                  />
                  <motion.circle
                    r="2"
                    fill="#38bdf8"
                    animate={{
                      cx: [`${link.x1}%`, `${link.x2}%`],
                      cy: [`${link.y1}%`, `${link.y2}%`],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: link.duration * 0.75,
                      repeat: Infinity,
                      ease: "easeInOut",
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
                  fill="#22d3ee"
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [0.9, 1.2, 0.9],
                  }}
                  transition={{
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: node.delay,
                  }}
                />
              ))}
            </svg>

            {/* Controlled Vignette for Text Legibility & Focus */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(6,9,19,0.85)_100%)] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Light Mode Structural Ambient Fallbacks */}
      {!isDark && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-sky-400/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* 1. FIXED TOP HEADER */}
      <header className="z-40 w-full shrink-0 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#060913]/90 backdrop-blur-md">
        <Header isDark={isDark} toggleTheme={toggleTheme} />
      </header>

      {/* 2. MAIN BODY WRAPPER (Full Width Fluid Layout) */}
      <div className="relative z-10 flex flex-1 w-full min-h-0 overflow-hidden">
        
        {/* FIXED LEFT SIDEBAR */}
        <aside aria-label="Sidebar Navigation" className="hidden md:flex flex-col shrink-0 h-full overflow-y-auto z-20 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#060913]/60 backdrop-blur-md">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        </aside>

        {/* SCROLLABLE OUTLET CONTAINER */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 pb-20 md:pb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-full" tabIndex={-1}>
          <div className="w-full min-h-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav aria-label="Mobile Navigation" className="md:hidden z-40 shrink-0 bg-white/90 dark:bg-[#060913]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80">
        <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
      </nav>
    </div>
  );
}