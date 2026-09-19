export const globalStyles = `
:root {
  color-scheme: dark;
  --bg-0: #08090C;
  --bg-1: #0C0E13;
  --bg-2: #13161D;
  --bg-3: #1A1E27;

  --fg: #F4F5F7;
  --fg-2: rgba(244, 245, 247, 0.68);
  --fg-3: rgba(244, 245, 247, 0.44);
  --fg-4: rgba(244, 245, 247, 0.22);

  --accent: #4F8EFF;
  --accent-2: #2563EB;
  --accent-3: #7AB0FF;
  --accent-soft: rgba(79, 142, 255, 0.12);

  --line-1: rgba(244, 245, 247, 0.06);
  --line-2: rgba(244, 245, 247, 0.11);
  --line-3: rgba(244, 245, 247, 0.20);

  --surface-tint: rgba(244, 245, 247, 0.035);
  --glass-bg: rgba(244, 245, 247, 0.05);
  --glass-bg-2: rgba(8, 11, 17, 0.72);

  --nav-bg: rgba(8, 9, 12, 0.72);
  --nav-border: rgba(244, 245, 247, 0.07);
  --drawer-bg: rgba(8, 11, 17, 0.97);

  --btn-invert-bg: #F4F5F7;
  --btn-invert-fg: #08090C;

  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-2: 0 16px 40px -20px rgba(0, 0, 0, 0.6);
  --shadow-3: 0 40px 100px -40px rgba(0, 0, 0, 0.9);

  --ease: cubic-bezier(.22, 1, .36, 1);
}

*, *::before, *::after { box-sizing: border-box; }

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-0);
  color: var(--fg);
  max-width: 100%;
  overflow-x: clip;
}

body {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-feature-settings: 'ss01' on, 'cv11' on, 'cv02' on;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

img, video, svg { display: block; max-width: 100%; }
button, input, textarea, select { font: inherit; color: inherit; }

.skilled-page {
  position: relative;
  isolation: isolate;
  background: var(--bg-0);
  color: var(--fg);
  min-height: 100vh;
}

.skilled-page main { position: relative; z-index: 0; }
.skilled-page main > section { position: relative; }
.skilled-page section[id] { scroll-margin-top: 96px; }

.text-fg { color: var(--fg); }
.text-fg-2 { color: var(--fg-2); }
.text-fg-3 { color: var(--fg-3); }
.text-fg-4 { color: var(--fg-4); }
.text-accent { color: var(--accent); }

.border-hairline { border-color: var(--line-1); }
.border-soft { border-color: var(--line-2); }
.border-medium { border-color: var(--line-3); }

.bg-base { background: var(--bg-0); }
.bg-raised { background: var(--bg-1); }
.bg-elevated { background: var(--bg-2); }

.btn-invert {
  background: var(--btn-invert-bg);
  color: var(--btn-invert-fg);
  transition: opacity 300ms var(--ease), transform 400ms var(--ease);
}
.btn-invert:hover { opacity: 0.92; }
.btn-invert:active { transform: scale(0.985); }

.btn-outline {
  border: 1px solid var(--line-3);
  color: var(--fg);
  transition: border-color 400ms var(--ease), background 400ms var(--ease), transform 400ms var(--ease);
}
.btn-outline:hover {
  border-color: var(--accent);
  background: var(--glass-bg);
}
.btn-outline:active { transform: scale(0.985); }

.serif {
  font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.015em;
}

.tabular { font-variant-numeric: tabular-nums; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.6875rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fg-3);
  font-weight: 500;
}
.eyebrow::before {
  content: "";
  width: 24px;
  height: 1px;
  background: currentColor;
  opacity: 0.7;
}
.eyebrow.no-line::before { display: none; }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  background: var(--surface-tint);
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fg-3);
  transition: border-color 300ms var(--ease), color 300ms var(--ease);
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--line-2);
  border-bottom: 1px solid var(--line-2);
}
@media (max-width: 767px) {
  .stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.stat-cell {
  padding: 1.5rem 1.25rem;
  border-left: 1px solid var(--line-2);
}
.stat-cell:first-child { border-left: 0; }
@media (max-width: 767px) {
  .stat-cell:nth-child(odd) { border-left: 0; }
  .stat-cell:nth-child(n + 3) { border-top: 1px solid var(--line-2); }
}
.stat-value {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.045em;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}
.stat-label {
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.glass {
  background: var(--glass-bg);
  border: 1px solid var(--line-2);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
}

.glass-strong {
  background: var(--glass-bg-2);
  border: 1px solid var(--line-2);
  backdrop-filter: blur(28px) saturate(140%);
  -webkit-backdrop-filter: blur(28px) saturate(140%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    var(--shadow-3);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@media (hover: hover) and (pointer: fine) {
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: var(--bg-0); }
  ::-webkit-scrollbar-thumb {
    background: var(--line-3);
    border-radius: 999px;
    border: 2px solid var(--bg-0);
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--fg-4); }
}

.grain::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.5) 0px,
      rgba(255, 255, 255, 0.5) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.35) 0px,
      rgba(255, 255, 255, 0.35) 1px,
      transparent 1px,
      transparent 3px
    );
  background-size: 3px 3px;
}

.link-underline { position: relative; }
.link-underline::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: -3px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 420ms var(--ease);
}
.link-underline:hover::after,
.link-underline:focus-visible::after { transform: scaleX(1); }

::selection { background: var(--accent-soft); color: var(--fg); }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ============================================================
   HERO TOKENS — dark only
   ============================================================ */
.hero-section {
  --hero-fg: #FFFFFF;
  --hero-fg-2: rgba(255, 255, 255, 0.70);
  --hero-fg-3: rgba(255, 255, 255, 0.44);
  --hero-border: rgba(255, 255, 255, 0.14);
  --hero-chip-bg: rgba(255, 255, 255, 0.06);
  --hero-chip-border: rgba(255, 255, 255, 0.14);
  --hero-overlay-top: rgba(8, 9, 12, 0.86);
  --hero-overlay-mid: rgba(8, 9, 12, 0.30);
  --hero-overlay-bot: rgba(8, 9, 12, 0.96);
  --hero-btn-primary-bg: #FFFFFF;
  --hero-btn-primary-fg: #08090C;
  --hero-img-filter: saturate(0.95) contrast(1.02) brightness(0.94);
}
`;