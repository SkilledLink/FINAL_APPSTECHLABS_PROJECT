// src/components/layout/AppLayout/AppLayout.tsx

import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavigation from "../MobileNavigation/MobileNavigation";
import { useTheme } from "../../../providers/ThemeProvider";
import { NotificationProvider } from "../../../features/notifications";

export default function AppLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <NotificationProvider>
      <div
        className="
          relative flex h-[100dvh] w-full flex-col overflow-hidden
          bg-[#eef4fa] dark:bg-[#050b14]
          font-sans text-slate-800 dark:text-slate-100
          transition-colors duration-500
          selection:bg-blue-500 selection:text-white
        "
      >
        {/* =========================================================
            BACKGROUND SYSTEM · identical to AuthLayout
        ========================================================== */}

        {/* 1 · Base technical grid — masked so it fades out */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.40] dark:opacity-[0.14] z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
            maskImage:
              "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)",
          }}
        />

        {/* 2 · Layered mesh — cooler, deeper, more controlled */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
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
          aria-hidden="true"
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
            blur-[140px] pointer-events-none z-0
          "
        />

        <motion.div
          aria-hidden="true"
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
            blur-[160px] pointer-events-none z-0
          "
        />

        {/* Central soft light — anchoring the composition */}
        <div
          aria-hidden="true"
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-[700px] h-[700px] rounded-full
            bg-blue-500/[0.03] dark:bg-blue-400/[0.02]
            blur-[100px] pointer-events-none z-0
          "
        />

        {/* 4 · Technical SVG background — refined opacities */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1400 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="appBlueLine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="appShapeFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.01" />
              </linearGradient>

              <filter id="appSoftGlow">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* ── Architectural polygons ── */}
            <motion.path
              d="M-100 180 L280 -40 L560 170 L310 430 L-70 360 Z"
              fill="url(#appShapeFill)"
              stroke="url(#appBlueLine)"
              strokeWidth="1"
              animate={{ opacity: [0.6, 0.9, 0.6], x: [0, 6, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.path
              d="M1100 -80 L1480 70 L1320 390 L1010 260 Z"
              fill="url(#appShapeFill)"
              stroke="url(#appBlueLine)"
              strokeWidth="1"
              animate={{ opacity: [0.45, 0.8, 0.45] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />

            <path
              d="M-120 690 L170 480 L430 650 L210 930 L-100 870 Z"
              fill="url(#appShapeFill)"
              stroke="url(#appBlueLine)"
              strokeWidth="1"
            />

            <path
              d="M1080 560 L1390 400 L1510 720 L1280 940 L1030 780 Z"
              fill="url(#appShapeFill)"
              stroke="url(#appBlueLine)"
              strokeWidth="1"
            />

            {/* ── Diagonal lines ── */}
            <g fill="none" stroke="url(#appBlueLine)" strokeWidth="1">
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
              <circle cx="180" cy="170" r="12" fill="#2563EB" opacity="0.06" filter="url(#appSoftGlow)" />
              <circle cx="1210" cy="710" r="4" fill="#06B6D4" opacity="0.6" />
              <circle cx="1210" cy="710" r="13" fill="#06B6D4" opacity="0.06" filter="url(#appSoftGlow)" />
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
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-[0.16] dark:opacity-[0.24] mix-blend-overlay pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="appNoise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#appNoise)" />
        </svg>

        {/* 6 · Outer vignette — cinematic focus */}
        <div
          aria-hidden="true"
          className="
            absolute inset-0 pointer-events-none z-0
            bg-[radial-gradient(circle_at_center,transparent_38%,rgba(15,23,42,0.06)_100%)]
            dark:bg-[radial-gradient(circle_at_center,transparent_32%,rgba(0,0,0,0.40)_100%)]
          "
        />

        {/* =========================================================
            FLOATING PARTICLES · subtle, only 3, muted
        ========================================================== */}

        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -22, 0], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute top-[18%] left-[8%]
            w-1.5 h-1.5 rounded-full
            bg-blue-500
            shadow-[0_0_14px_rgba(37,99,235,0.65)]
            pointer-events-none z-0
          "
        />

        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 26, 0], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute top-[25%] right-[12%]
            w-1 h-1 rounded-full
            bg-cyan-400
            shadow-[0_0_12px_rgba(34,211,238,0.6)]
            pointer-events-none z-0
          "
        />

        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -18, 0], x: [0, 12, 0], opacity: [0.18, 0.5, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="
            absolute bottom-[18%] left-[18%]
            w-1 h-1 rounded-full
            bg-blue-400
            shadow-[0_0_10px_rgba(59,130,246,0.6)]
            pointer-events-none z-0
          "
        />

        {/* =========================================================
            FIXED TOP HEADER
        ========================================================== */}
        <header
          className="
            relative z-40 w-full shrink-0
            border-b
            border-slate-900/[0.06] dark:border-white/[0.06]
            bg-white/60 dark:bg-[#070b14]/60
            backdrop-blur-xl
          "
        >
          <Header isDark={isDark} toggleTheme={toggleTheme} />
        </header>

        {/* =========================================================
            BODY: sidebar + outlet
        ========================================================== */}
        <div className="relative z-10 flex min-h-0 w-full flex-1 overflow-hidden">
          <aside
            aria-label="Sidebar Navigation"
            className="relative z-20 hidden h-full shrink-0 md:flex"
          >
            <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          </aside>

          {/* ⚠️ THE FIX: added `relative` so absolutely-positioned pages
              (like MessagesPage) can anchor themselves to this box
              instead of trying to resolve `h-full` against a scroll
              container, which the CSS spec does not allow. */}
          <main
            tabIndex={-1}
            className="
              relative
              min-w-0 min-h-0 flex-1
              overflow-y-auto overflow-x-hidden scrollbar-hide
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            "
          >
            <Outlet />
          </main>
        </div>

        {/* =========================================================
            MOBILE BOTTOM NAV
        ========================================================== */}
        <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
      </div>
    </NotificationProvider>
  );
}