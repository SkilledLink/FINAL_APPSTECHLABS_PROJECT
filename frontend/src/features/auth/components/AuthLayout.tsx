// src/features/auth/components/AuthLayout.tsx

import React, { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Headphones,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface AuthLayoutProps {
  heroImageSrc?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  heroImageSrc = "https://gbengineering.cm/wp-content/uploads/2025/04/blog_post-6.png",
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      try { localStorage.setItem("theme", "dark"); } catch { /* ignore */ }
    } else {
      root.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch { /* ignore */ }
    }
  }, [isDark]);

  return (
    <div
      className="
        min-h-screen w-full relative overflow-hidden flex items-center justify-center
        p-4 sm:p-6 md:p-10
        bg-[#eef4fa] dark:bg-[#050b14]
        text-slate-800 dark:text-slate-100
        transition-colors duration-500 font-sans
      "
    >
      {/* =========================================================
          BACKGROUND SYSTEM · layered, quiet, photographic
      ========================================================== */}

      {/* 1 · Base technical grid — masked so it fades out */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.40] dark:opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)",
        }}
      />

      {/* 2 · Layered mesh — cooler, deeper, more controlled */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, rgba(37,99,235,0.22), transparent 32%),
              radial-gradient(circle at 88% 12%, rgba(6,182,212,0.16), transparent 30%),
              radial-gradient(circle at 82% 88%, rgba(37,99,235,0.20), transparent 34%),
              radial-gradient(circle at 18% 88%, rgba(14,165,233,0.14), transparent 30%)
            `
            : `
              radial-gradient(circle at 8% 12%, rgba(37,99,235,0.14), transparent 30%),
              radial-gradient(circle at 92% 8%, rgba(6,182,212,0.12), transparent 28%),
              radial-gradient(circle at 92% 92%, rgba(59,130,246,0.11), transparent 32%),
              radial-gradient(circle at 8% 92%, rgba(14,165,233,0.09), transparent 28%)
            `,
        }}
      />

      {/* 3 · Ambient glows — larger, softer, slower */}
      <motion.div
        animate={{
          x: [0, 30, -18, 0],
          y: [0, -22, 18, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute -top-56 -left-56
          w-[720px] h-[720px] rounded-full
          bg-blue-500/[0.15] dark:bg-blue-600/[0.12]
          blur-[140px] pointer-events-none
        "
      />

      <motion.div
        animate={{
          x: [0, -26, 18, 0],
          y: [0, 26, -14, 0],
          scale: [1, 0.95, 1.06, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute -bottom-60 -right-56
          w-[780px] h-[780px] rounded-full
          bg-cyan-400/[0.14] dark:bg-blue-700/[0.12]
          blur-[160px] pointer-events-none
        "
      />

      {/* Central soft light — anchoring the composition */}
      <div className="
        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-[700px] h-[700px] rounded-full
        bg-blue-500/[0.03] dark:bg-blue-400/[0.02]
        blur-[100px] pointer-events-none
      " />

      {/* 4 · Technical SVG background — refined opacities, softer strokes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blueLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="shapeFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.01" />
            </linearGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* ── Architectural polygons ── */}
          <motion.path
            d="M-100 180 L280 -40 L560 170 L310 430 L-70 360 Z"
            fill="url(#shapeFill)"
            stroke="url(#blueLine)"
            strokeWidth="1"
            animate={{ opacity: [0.6, 0.9, 0.6], x: [0, 6, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M1100 -80 L1480 70 L1320 390 L1010 260 Z"
            fill="url(#shapeFill)"
            stroke="url(#blueLine)"
            strokeWidth="1"
            animate={{ opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

          <path
            d="M-120 690 L170 480 L430 650 L210 930 L-100 870 Z"
            fill="url(#shapeFill)"
            stroke="url(#blueLine)"
            strokeWidth="1"
          />

          <path
            d="M1080 560 L1390 400 L1510 720 L1280 940 L1030 780 Z"
            fill="url(#shapeFill)"
            stroke="url(#blueLine)"
            strokeWidth="1"
          />

          {/* ── Diagonal lines ── */}
          <g fill="none" stroke="url(#blueLine)" strokeWidth="1">
            <path d="M0 300 L360 0" />
            <path d="M0 340 L410 0" />
            <path d="M1000 0 L1400 360" />
            <path d="M1070 0 L1400 290" />
            <path d="M0 650 L330 900" />
            <path d="M0 600 L400 900" />
            <path d="M1080 900 L1400 600" />
            <path d="M1020 900 L1400 540" />
          </g>

          {/* ── Concentric circles ── */}
          <g fill="none" stroke="#2563EB" strokeOpacity="0.09">
            <circle cx="180" cy="170" r="90" />
            <circle cx="180" cy="170" r="120" />
            <circle cx="180" cy="170" r="150" />
            <circle cx="1210" cy="710" r="100" />
            <circle cx="1210" cy="710" r="135" />
            <circle cx="1210" cy="710" r="170" />
          </g>

          {/* ── Glowing nodes ── */}
          <g>
            <circle cx="180" cy="170" r="4" fill="#2563EB" opacity="0.55" />
            <circle cx="180" cy="170" r="12" fill="#2563EB" opacity="0.06" filter="url(#softGlow)" />
            <circle cx="1210" cy="710" r="4" fill="#06B6D4" opacity="0.6" />
            <circle cx="1210" cy="710" r="13" fill="#06B6D4" opacity="0.06" filter="url(#softGlow)" />
            <circle cx="900" cy="110" r="3" fill="#2563EB" opacity="0.4" />
            <circle cx="500" cy="780" r="3" fill="#06B6D4" opacity="0.4" />
          </g>

          {/* ── Blueprint cross markers ── */}
          <g stroke="#2563EB" strokeOpacity="0.18" strokeWidth="1">
            <path d="M420 120 h16 M428 112 v16" />
            <path d="M980 190 h16 M988 182 v16" />
            <path d="M300 760 h16 M308 752 v16" />
            <path d="M1120 360 h16 M1128 352 v16" />
          </g>
        </svg>
      </div>

      {/* 5 · Film grain — the premium texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.16] dark:opacity-[0.24] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="sl-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#sl-noise)" />
      </svg>

      {/* 6 · Outer vignette — cinematic focus */}
      <div className="
        absolute inset-0 pointer-events-none
        bg-[radial-gradient(circle_at_center,transparent_38%,rgba(15,23,42,0.06)_100%)]
        dark:bg-[radial-gradient(circle_at_center,transparent_32%,rgba(0,0,0,0.40)_100%)]
      " />

      {/* =========================================================
          FLOATING PARTICLES · subtle, only 3, muted
      ========================================================== */}

      <motion.div
        animate={{ y: [0, -22, 0], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute top-[18%] left-[8%]
          w-1.5 h-1.5 rounded-full
          bg-blue-500
          shadow-[0_0_14px_rgba(37,99,235,0.65)]
          pointer-events-none
        "
      />

      <motion.div
        animate={{ y: [0, 26, 0], opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute top-[25%] right-[12%]
          w-1 h-1 rounded-full
          bg-cyan-400
          shadow-[0_0_12px_rgba(34,211,238,0.6)]
          pointer-events-none
        "
      />

      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 12, 0], opacity: [0.18, 0.5, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute bottom-[18%] left-[18%]
          w-1 h-1 rounded-full
          bg-blue-400
          shadow-[0_0_10px_rgba(59,130,246,0.6)]
          pointer-events-none
        "
      />

      {/* =========================================================
          TOP CONTROLS · back-to-home on left, controls on right
      ========================================================== */}

      {/* Top-left: back to home */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => (window.location.href = "/")}
          className="
            flex h-9 items-center gap-2 rounded-lg
            bg-white/60 dark:bg-white/[0.04]
            backdrop-blur-md
            border border-slate-900/[0.06] dark:border-white/[0.06]
            px-3.5 text-xs font-medium
            text-slate-600 dark:text-slate-400
            hover:text-blue-600 dark:hover:text-cyan-400
            hover:border-blue-500/25 dark:hover:border-cyan-400/25
            transition-all duration-200
            shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            cursor-pointer
          "
          aria-label="Back to home"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Back to home</span>
        </motion.button>
      </div>

      {/* Top-right: theme + support */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="
            flex h-9 w-9 items-center justify-center rounded-lg
            bg-white/60 dark:bg-white/[0.04]
            backdrop-blur-md
            border border-slate-900/[0.06] dark:border-white/[0.06]
            text-slate-600 dark:text-slate-400
            hover:text-blue-600 dark:hover:text-cyan-400
            hover:border-blue-500/25 dark:hover:border-cyan-400/25
            transition-all duration-200
            shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            cursor-pointer
          "
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="
            hidden sm:flex h-9 items-center gap-2 rounded-lg
            bg-white/60 dark:bg-white/[0.04]
            backdrop-blur-md
            border border-slate-900/[0.06] dark:border-white/[0.06]
            px-3.5 text-xs font-medium
            text-slate-600 dark:text-slate-400
            hover:text-blue-600 dark:hover:text-cyan-400
            hover:border-blue-500/25 dark:hover:border-cyan-400/25
            transition-all duration-200
            shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            cursor-pointer
          "
        >
          <Headphones size={13} />
          <span>Support</span>
        </motion.button>
      </div>

      {/* =========================================================
          MAIN GLASS CONTAINER · with 1px gradient border wrap
      ========================================================== */}

      <div className="relative w-full max-w-5xl h-[680px] sm:h-[700px] z-10">

        {/* Gradient border wrap */}
        <div className="absolute inset-0 rounded-[26px] bg-gradient-to-b from-slate-900/[0.09] via-slate-900/[0.03] to-transparent dark:from-white/[0.10] dark:via-white/[0.03] dark:to-transparent p-px">

          <div className="
            h-full w-full rounded-[25px] overflow-hidden
            grid grid-cols-1 lg:grid-cols-2
            bg-white/60 dark:bg-[#070b14]/85
            backdrop-blur-3xl
            shadow-[0_40px_100px_-30px_rgba(15,23,42,0.30)]
            dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)]
          ">

            {/* =======================================================
                LEFT COLUMN · Form
            ======================================================== */}

            <div
              className="h-full p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
              style={{ perspective: "1200px" }}
            >
              {/* Subtle corner glow inside the card */}
              <div className="
                absolute -top-32 -left-32
                w-72 h-72 rounded-full
                bg-blue-500/[0.08] dark:bg-blue-500/[0.06]
                blur-3xl pointer-events-none
              " />

              {/* Brand Header */}
              <div className="relative z-10 shrink-0 flex items-center gap-3 -mt-4">
                <div className="text-3xl font-bold tracking-tight">
                  <span className="text-slate-900 dark:text-white">Skilled</span>
                  <span className="text-blue-500">Link</span>
                </div>
              </div>

              {/* Form Area */}
              <div className="relative z-10 flex-1 flex flex-col justify-center overflow-y-auto no-scrollbar py-2 my-auto">
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
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Footer */}
              <div className="
                relative z-10 shrink-0 pt-4
                flex items-center justify-between
                text-[11px] font-medium
                text-slate-400 dark:text-slate-500
                border-t border-slate-900/[0.05] dark:border-white/[0.05]
              ">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-blue-500/80 dark:text-cyan-400/80" />
                  <span>Enterprise Service Network</span>
                </span>
                <span className="font-mono tracking-wider">CM · v2.4</span>
              </div>
            </div>

            {/* =======================================================
                RIGHT HERO PANEL · refined
            ======================================================== */}

            <div className="
              hidden lg:flex h-full relative flex-col justify-between p-10 overflow-hidden
              border-l border-slate-900/[0.06] dark:border-white/[0.05]
            ">
              {/* Hero Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.img
                  src={heroImageSrc}
                  alt="Professional Skilled Workforce"
                  initial={{ scale: 1.05 }}
                  animate={{ scale: [1.05, 1.10, 1.05], y: [-4, 4, -4] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full object-cover object-center pointer-events-none"
                />

                {/* Cool multiply scrim */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/55 via-slate-950/25 to-cyan-950/45 mix-blend-multiply pointer-events-none" />

                {/* Contrast overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/15 pointer-events-none" />

                {/* Soft blue glow inside the image */}
                <motion.div
                  animate={{ opacity: [0.12, 0.32, 0.12], scale: [1, 1.15, 1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="
                    absolute top-1/4 left-1/4
                    w-80 h-80 rounded-full
                    bg-blue-500/25 blur-3xl pointer-events-none
                  "
                />
              </div>

              {/* Hero technical decoration — quieter */}
              <div className="absolute inset-0 z-[1] pointer-events-none">
                <svg
                  className="w-full h-full opacity-[0.28]"
                  viewBox="0 0 600 700"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="heroGrid" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <g stroke="url(#heroGrid)" strokeWidth="1" fill="none">
                    <path d="M0 150 L600 0" />
                    <path d="M0 200 L600 50" />
                    <path d="M0 600 L600 450" />
                    <path d="M0 650 L600 500" />
                    <circle cx="500" cy="150" r="80" />
                    <circle cx="500" cy="150" r="105" />
                  </g>
                </svg>
              </div>

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="
                  inline-flex items-center gap-2
                  bg-white/[0.07] backdrop-blur-xl
                  px-3.5 py-1.5 rounded-full
                  border border-white/[0.10]
                  text-slate-200
                  text-[11px] font-medium
                  shadow-lg
                ">
                  <Building2 size={12} className="text-cyan-300/90" />
                  <span>Independent Artisans & Corporate Firms</span>
                </div>

                <div className="
                  w-9 h-9 rounded-full
                  bg-white/[0.07] backdrop-blur-md
                  border border-white/[0.10]
                  flex items-center justify-center
                ">
                  <Sparkles size={14} className="text-cyan-300/90" />
                </div>
              </div>

              {/* Hero Content — no hard box, floats on scrim */}
              <div className="relative z-10 space-y-3 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/90 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-cyan-200/85">
                    Skilled Workforce Network
                  </span>
                </div>

                <h2 className="text-[22px] font-semibold tracking-tight leading-tight text-white">
                  Connecting Cameroon's skilled professionals and enterprise services.
                </h2>

                <p className="text-[13px] text-slate-300/85 leading-relaxed">
                  Find verified local technicians for direct on-site jobs or hire registered engineering companies for complex infrastructure contracts.
                </p>

                {/* Stats — quiet, on a hairline top border */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center gap-6">
                  <div>
                    <p className="text-[15px] font-semibold text-white">Connect</p>
                    <p className="text-[10px] text-slate-400/80 tracking-wide">Professionals</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Hire</p>
                    <p className="text-[10px] text-slate-400/80 tracking-wide">Local Talent</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Grow</p>
                    <p className="text-[10px] text-slate-400/80 tracking-wide">Your Business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};