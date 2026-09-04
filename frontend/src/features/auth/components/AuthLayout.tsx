import React, { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Headphones, ShieldCheck, Building2 } from "lucide-react";

interface AuthLayoutProps {
  heroImageSrc?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  heroImageSrc = "https://gbengineering.cm/wp-content/uploads/2025/04/blog_post-6.png",
}) => {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen w-full bg-[#f0f4f8] dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* GEOMETRIC POLYGON BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="poly-grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon points="50,20 320,180 180,420 20,310" fill="url(#poly-grad-blue)" stroke="#2563EB" strokeWidth="0.5" />
          <polygon points="650,80 920,40 980,320 720,480" fill="url(#poly-grad-blue)" stroke="#2563EB" strokeWidth="0.5" />
          <polygon points="180,620 480,780 120,920" fill="url(#poly-grad-blue)" stroke="#2563EB" strokeWidth="0.5" />
          <polygon points="820,540 1150,710 980,940" fill="url(#poly-grad-blue)" stroke="#2563EB" strokeWidth="0.5" />
          <polygon points="400,200 600,120 550,380" fill="url(#poly-grad-blue)" stroke="#2563EB" strokeWidth="0.5" />
        </svg>
      </div>

      {/* AMBIENT GLOWS */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-800/60 hover:text-blue-600 dark:hover:text-white transition-all duration-200 shadow-sm">
          <Headphones size={15} />
          <span>Support</span>
        </button>
      </div>

      {/* Glass Container Card with fixed dimensions */}
      <div className="w-full max-w-5xl h-[680px] sm:h-[700px] bg-white/35 dark:bg-slate-900/35 backdrop-blur-2xl border border-white/60 dark:border-slate-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 z-10 relative">
        
        {/* Left Column: Form Section */}
        <div 
          className="h-full p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
          style={{ perspective: "1200px" }}
        >
          {/* Brand Header */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wide shadow-md shadow-blue-600/25">
              SL
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
            </span>
          </div>

          {/* Center Form Wrapper (Dynamic Page Flip Container) */}
          <div className="flex-1 flex flex-col justify-center overflow-y-auto no-scrollbar py-2 my-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{
                  rotateY: -70,
                  opacity: 0,
                  scale: 0.95,
                  transformOrigin: "left center",
                }}
                animate={{
                  rotateY: 0,
                  opacity: 1,
                  scale: 1,
                  transformOrigin: "left center",
                }}
                exit={{
                  rotateY: 70,
                  opacity: 0,
                  scale: 0.95,
                  transformOrigin: "right center",
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}
                className="w-full my-auto"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Note */}
          <div className="shrink-0 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-900/5 dark:border-white/5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              Enterprise Service Network
            </span>
            <span>Cameroon</span>
          </div>
        </div>

        {/* Right Column: Hero Image Panel (with Framer Motion animated image) */}
        <div className="hidden lg:flex h-full relative flex-col justify-between p-10 overflow-hidden bg-slate-950/20 border-l border-white/40 dark:border-slate-800/40">
          
          {/* Animated Hero Image Container */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Animated Background Image */}
            <motion.img
              src={heroImageSrc}
              alt="Professional Skilled Workforce"
              initial={{ scale: 1.05 }}
              animate={{
                scale: [1.05, 1.12, 1.05],
                y: [-6, 6, -6],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            />

            {/* Ambient Pulsing Glow Layer on top of image */}
            <motion.div
              animate={{
                opacity: [0.2, 0.45, 0.2],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl pointer-events-none"
            />

            {/* Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10 pointer-events-none" />
          </div>

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-slate-200 text-xs font-semibold">
              <Building2 size={13} className="text-blue-400" />
              <span>Independent Artisans & Corporate Firms</span>
            </div>
          </div>

          {/* Bottom Content Card */}
          <div className="relative z-10 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white space-y-2 shadow-2xl">
            <h2 className="text-xl font-bold tracking-tight leading-snug">
              Connecting Cameroon's skilled professionals and enterprise services.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Find verified local technicians for direct on-site jobs or hire registered engineering companies for complex infrastructure contracts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};