// src/features/onboarding/components/OnboardingLayout.tsx

import React, { useEffect, useState } from "react";
import { Moon, Sun, Headphones } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  /** Max width class for the content area. Defaults to max-w-3xl. */
  maxWidth?: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  maxWidth = "max-w-3xl",
}) => {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <div className="min-h-screen w-full bg-[#f0f4f8] dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-300">
      {/* ── GEOMETRIC POLYGON BACKGROUND ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient
              id="onb-poly-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon
            points="50,20 320,180 180,420 20,310"
            fill="url(#onb-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="650,80 920,40 980,320 720,480"
            fill="url(#onb-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="180,620 480,780 120,920"
            fill="url(#onb-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="820,540 1150,710 980,940"
            fill="url(#onb-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="400,200 600,120 550,380"
            fill="url(#onb-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* ── AMBIENT GLOWS ─────────────────────────────────── */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP-LEFT: BRAND ───────────────────────────────── */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3 select-none">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/25">
          SL
        </div>
        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          skilled
          <span className="text-blue-600 dark:text-blue-400">Link</span>
        </span>
      </div>

      {/* ── TOP-RIGHT: CONTROLS ───────────────────────────── */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsDark((p) => !p)}
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          type="button"
          className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-800/60 hover:text-blue-600 dark:hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Headphones size={15} />
          <span>Support</span>
        </button>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex items-start sm:items-center justify-center px-4 sm:px-8 pt-24 pb-16">
        <div className={`w-full ${maxWidth}`}>{children}</div>
      </div>
    </div>
  );
};