// src/features/ai/components/AIBackground.tsx
/**
 * Shared decorative background — a 1:1 mirror of AppLayout's
 * background stack (grid → mesh → glows → SVG → grain → vignette →
 * particles) so the AI surfaces sit on the same canvas as the
 * rest of the app.
 *
 * Drop inside a `relative` parent that has no opaque background of
 * its own. This component paints every layer.
 *
 * Theme awareness: every layer uses Tailwind's `dark:` variants
 * (with `dark:hidden` / `hidden dark:block` for the mesh gradient
 * that needs different geometry per theme), so no React hook is
 * required and it never fights the top-level theme provider.
 */
import { motion } from 'framer-motion';

export function AIBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* ── 1 · Base technical grid ───────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.40] dark:opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 90%)',
        }}
      />

      {/* ── 2 · Layered mesh — light variant ─────────────────── */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(circle at 8% 12%, rgba(37,99,235,0.14), transparent 30%),
            radial-gradient(circle at 92% 8%, rgba(6,182,212,0.12), transparent 28%),
            radial-gradient(circle at 92% 92%, rgba(59,130,246,0.11), transparent 32%),
            radial-gradient(circle at 8% 92%, rgba(14,165,233,0.09), transparent 28%)
          `,
        }}
      />

      {/* ── 2 · Layered mesh — dark variant ──────────────────── */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(circle at 12% 18%, rgba(37,99,235,0.22), transparent 32%),
            radial-gradient(circle at 88% 12%, rgba(6,182,212,0.16), transparent 30%),
            radial-gradient(circle at 82% 88%, rgba(37,99,235,0.20), transparent 34%),
            radial-gradient(circle at 18% 88%, rgba(14,165,233,0.14), transparent 30%)
          `,
        }}
      />

      {/* ── 3 · Ambient glows ────────────────────────────────── */}
      <motion.div
        animate={{
          x: [0, 30, -18, 0],
          y: [0, -22, 18, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute -top-56 -left-56
          w-[720px] h-[720px] rounded-full
          bg-blue-500/[0.15] dark:bg-blue-600/[0.12]
          blur-[140px]
        "
      />

      <motion.div
        animate={{
          x: [0, -26, 18, 0],
          y: [0, 26, -14, 0],
          scale: [1, 0.95, 1.06, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute -bottom-60 -right-56
          w-[780px] h-[780px] rounded-full
          bg-cyan-400/[0.14] dark:bg-blue-700/[0.12]
          blur-[160px]
        "
      />

      {/* Central anchoring soft light */}
      <div
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[700px] h-[700px] rounded-full
          bg-blue-500/[0.03] dark:bg-blue-400/[0.02]
          blur-[100px]
        "
      />

      {/* ── 4 · Technical SVG — polygons, lines, circles, nodes,
             cross markers ───────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ai-bg-blue-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ai-bg-shape-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.01" />
          </linearGradient>

          <filter id="ai-bg-soft-glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Architectural polygons */}
        <motion.path
          d="M-100 180 L280 -40 L560 170 L310 430 L-70 360 Z"
          fill="url(#ai-bg-shape-fill)"
          stroke="url(#ai-bg-blue-line)"
          strokeWidth="1"
          animate={{ opacity: [0.6, 0.9, 0.6], x: [0, 6, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          d="M1100 -80 L1480 70 L1320 390 L1010 260 Z"
          fill="url(#ai-bg-shape-fill)"
          stroke="url(#ai-bg-blue-line)"
          strokeWidth="1"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <path
          d="M-120 690 L170 480 L430 650 L210 930 L-100 870 Z"
          fill="url(#ai-bg-shape-fill)"
          stroke="url(#ai-bg-blue-line)"
          strokeWidth="1"
        />

        <path
          d="M1080 560 L1390 400 L1510 720 L1280 940 L1030 780 Z"
          fill="url(#ai-bg-shape-fill)"
          stroke="url(#ai-bg-blue-line)"
          strokeWidth="1"
        />

        {/* Diagonal lines */}
        <g fill="none" stroke="url(#ai-bg-blue-line)" strokeWidth="1">
          <path d="M0 300 L360 0" />
          <path d="M0 340 L410 0" />
          <path d="M1000 0 L1400 360" />
          <path d="M1070 0 L1400 290" />
          <path d="M0 650 L330 900" />
          <path d="M0 600 L400 900" />
          <path d="M1080 900 L1400 600" />
          <path d="M1020 900 L1400 540" />
        </g>

        {/* Concentric circles */}
        <g fill="none" stroke="#2563EB" strokeOpacity="0.09">
          <circle cx="180" cy="170" r="90" />
          <circle cx="180" cy="170" r="120" />
          <circle cx="180" cy="170" r="150" />
          <circle cx="1210" cy="710" r="100" />
          <circle cx="1210" cy="710" r="135" />
          <circle cx="1210" cy="710" r="170" />
        </g>

        {/* Glowing nodes */}
        <g>
          <circle cx="180" cy="170" r="4" fill="#2563EB" opacity="0.55" />
          <circle
            cx="180"
            cy="170"
            r="12"
            fill="#2563EB"
            opacity="0.06"
            filter="url(#ai-bg-soft-glow)"
          />
          <circle cx="1210" cy="710" r="4" fill="#06B6D4" opacity="0.6" />
          <circle
            cx="1210"
            cy="710"
            r="13"
            fill="#06B6D4"
            opacity="0.06"
            filter="url(#ai-bg-soft-glow)"
          />
          <circle cx="900" cy="110" r="3" fill="#2563EB" opacity="0.4" />
          <circle cx="500" cy="780" r="3" fill="#06B6D4" opacity="0.4" />
        </g>

        {/* Blueprint cross markers */}
        <g stroke="#2563EB" strokeOpacity="0.18" strokeWidth="1">
          <path d="M420 120 h16 M428 112 v16" />
          <path d="M980 190 h16 M988 182 v16" />
          <path d="M300 760 h16 M308 752 v16" />
          <path d="M1120 360 h16 M1128 352 v16" />
        </g>
      </svg>

      {/* ── 5 · Film grain ───────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.16] dark:opacity-[0.24] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ai-bg-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#ai-bg-noise)" />
      </svg>

      {/* ── 6 · Cinematic vignette ───────────────────────────── */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_38%,rgba(15,23,42,0.06)_100%)]
          dark:bg-[radial-gradient(circle_at_center,transparent_32%,rgba(0,0,0,0.40)_100%)]
        "
      />

      {/* ── 7 · Three muted floating particles ───────────────── */}
      <motion.div
        animate={{ y: [0, -22, 0], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute top-[18%] left-[8%]
          w-1.5 h-1.5 rounded-full
          bg-blue-500
          shadow-[0_0_14px_rgba(37,99,235,0.65)]
        "
      />

      <motion.div
        animate={{ y: [0, 26, 0], opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute top-[25%] right-[12%]
          w-1 h-1 rounded-full
          bg-cyan-400
          shadow-[0_0_12px_rgba(34,211,238,0.6)]
        "
      />

      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 12, 0], opacity: [0.18, 0.5, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="
          absolute bottom-[18%] left-[18%]
          w-1 h-1 rounded-full
          bg-blue-400
          shadow-[0_0_10px_rgba(59,130,246,0.6)]
        "
      />
    </div>
  );
}