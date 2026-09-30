// src/features/landing/components/FeaturedProps.tsx
// Requires framer-motion >= 10.12 (useMotionValueEvent).

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";

const INK = "#06142e";
const BLUE = "#2563EB";
const PAPER = "#FFFFFF";

const ease = [0.16, 1, 0.3, 1] as const;

const LEAD = 0.7;
const TRAVEL = 1.0;
const DWELL = 0.9;

const STEPS: [number, number, "linear" | "easeInOut"][] = [[0, LEAD, "linear"]];
for (let i = 1; i < 6; i++) {
  STEPS.push([i / 5, TRAVEL, "easeInOut"]);
  if (i < 5) STEPS.push([i / 5, DWELL, "linear"]);
}
const TOTAL = STEPS.reduce((s, [, d]) => s + d, 0);
const VALUES = [0, ...STEPS.map(([v]) => v)];
const EASES = STEPS.map(([, , e]) => e);
let acc = 0;
const TIMES = [0, ...STEPS.map(([, d]) => (acc += d) / TOTAL)];

const W = 1200;
const H = 120;
const PTS = Array.from({ length: 6 }, (_, i) => ({
  x: 100 + i * 200,
  y: i % 2 === 0 ? 82 : 38,
}));
const PATH_D = PTS.map((p, i) =>
  i === 0
    ? `M ${p.x},${p.y}`
    : `C ${PTS[i - 1].x + 100},${PTS[i - 1].y} ${p.x - 100},${p.y} ${p.x},${p.y}`
).join(" ");
const pct = (v: number, max: number) => `${(v / max) * 100}%`;

type On = { on: boolean };

function Line({
  d, on, delay = 0, color = INK, w = 1.75, dur = 0.7, o = 1,
}: On & { d: string; delay?: number; color?: string; w?: number; dur?: number; o?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={false}
      animate={on ? { pathLength: 1, opacity: o } : { pathLength: 0, opacity: 0 }}
      transition={reduce ? { duration: 0 } : { duration: dur, delay: on ? delay : 0, ease: "easeInOut" }}
    />
  );
}

function Pop({
  on, delay = 0, from = 0.5, x = 0, y = 0, origin = "center", children,
}: On & { delay?: number; from?: number; x?: number; y?: number; origin?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const d = on ? delay : 0;
  return (
    <motion.g
      initial={false}
      animate={on ? { opacity: 1, scale: 1, x: 0, y: 0 } : { opacity: 0, scale: from, x, y }}
      transition={
        reduce
          ? { duration: 0 }
          : { delay: d, type: "spring", stiffness: 240, damping: 15, opacity: { duration: 0.25, delay: d } }
      }
      style={{ transformBox: "fill-box", transformOrigin: origin }}
    >
      {children}
    </motion.g>
  );
}

function Shift({ on, delay = 0, dy = -5, children }: On & { delay?: number; dy?: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.g
      initial={false}
      animate={{ y: on ? dy : 0 }}
      transition={reduce ? { duration: 0 } : { delay: on ? delay : 0, type: "spring", stiffness: 200, damping: 12 }}
    >
      {children}
    </motion.g>
  );
}

function Ring({
  on, cx, cy, r, squash = 1, delay = 0, loop = false, color = BLUE,
}: On & { cx: number; cy: number; r: number; squash?: number; delay?: number; loop?: boolean; color?: string }) {
  const reduce = useReducedMotion();
  const go = on && !reduce;
  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={r}
      ry={r * squash}
      stroke={color}
      strokeWidth={1.5}
      fill="none"
      initial={false}
      animate={go ? { scale: [0.5, 1.8], opacity: [0.75, 0] } : { scale: 0.5, opacity: 0 }}
      transition={
        go
          ? { duration: 1.6, delay, ease: "easeOut", repeat: loop ? Infinity : 0, repeatDelay: 0.6 }
          : { duration: 0 }
      }
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

function Burst({
  on, cx, cy, r1, r2, n = 8, delay = 0, color = BLUE,
}: On & { cx: number; cy: number; r1: number; r2: number; n?: number; delay?: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const p = (r: number) => `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
        return (
          <motion.path
            key={i}
            d={`M${p(r1)} L${p(r2)}`}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            initial={false}
            animate={
              on && !reduce
                ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.9, delay: on ? delay + i * 0.02 : 0, times: [0, 0.4, 1], ease: "easeOut" }}
          />
        );
      })}
    </g>
  );
}

const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";

function Stage({ on, children }: On & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 150" fill="none" className="h-auto w-full max-w-[168px] overflow-visible">
      <motion.circle
        cx={80}
        cy={76}
        r={62}
        stroke={INK}
        strokeWidth={1}
        strokeDasharray="2 5"
        strokeLinecap="round"
        initial={false}
        animate={{ opacity: on ? 0 : 0.18 }}
        transition={{ duration: 0.5 }}
      />
      <Pop on={on} from={0.4}>
        <circle cx={80} cy={76} r={62} fill="rgba(37,99,235,0.11)" />
      </Pop>
      {children}
    </svg>
  );
}

/* ---------------- SCENES ---------------- */

const Register = ({ on }: On) => (
  <Stage on={on}>
    <Pop on={on} from={1} delay={0.1}>
      <rect x={48} y={20} width={64} height={110} rx={8} fill={PAPER} />
    </Pop>
    <Line on={on} delay={0.1} dur={0.8} d="M56,20 h48 a8,8 0 0 1 8,8 v94 a8,8 0 0 1 -8,8 h-48 a8,8 0 0 1 -8,-8 v-94 a8,8 0 0 1 8,-8 z" />
    <Line on={on} delay={0.6} dur={0.3} o={0.35} d="M72,27 h16" />
    <Pop on={on} delay={0.6}>
      <circle cx={80} cy={54} r={13} stroke={INK} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="3 3" />
    </Pop>
    <Line on={on} delay={0.85} dur={0.3} color={BLUE} w={2.2} d="M80,48 v12 M74,54 h12" />
    <Line on={on} delay={1.0} dur={0.4} o={0.5} d="M60,84 h40" />
    <Line on={on} delay={1.15} dur={0.35} o={0.5} d="M60,96 h26" />
    <Pop on={on} delay={1.3}>
      <rect x={58} y={108} width={44} height={12} rx={6} fill={BLUE} />
    </Pop>
    <Line on={on} delay={1.5} dur={0.3} color={PAPER} w={2} d="M74,114 l4,3 l8,-7" />
    <Pop on={on} delay={1.65} from={0}>
      <circle cx={116} cy={34} r={9} fill={BLUE} />
    </Pop>
    <Line on={on} delay={1.8} dur={0.25} color={PAPER} w={2} d="M112,34 l3,3 l5,-6" />
  </Stage>
);

const Pro = ({ on }: On) => (
  <Stage on={on}>
    <Pop on={on} from={1} delay={0.05}>
      <rect x={34} y={30} width={92} height={88} rx={10} fill={PAPER} />
    </Pop>
    <Line on={on} delay={0.05} dur={0.8} d="M44,30 h72 a10,10 0 0 1 10,10 v68 a10,10 0 0 1 -10,10 h-72 a10,10 0 0 1 -10,-10 v-68 a10,10 0 0 1 10,-10 z" />
    <Line on={on} delay={0.5} dur={0.5} d="M68,66 a12,12 0 1 0 24,0 a12,12 0 1 0 -24,0" />
    <Line on={on} delay={0.7} dur={0.5} d="M54,112 c0,-16 11,-24 26,-24 s26,8 26,24" />
    <Pop on={on} from={1} y={-46} delay={1.0}>
      <path d="M63,62 a17,17 0 0 1 34,0 z" fill={BLUE} stroke={INK} strokeWidth={1.75} strokeLinejoin="round" />
      <path d="M58,62 h44" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M80,46 v9" stroke={INK} strokeOpacity={0.45} strokeWidth={1.5} strokeLinecap="round" />
    </Pop>
    <Pop on={on} delay={1.45} from={0.3}>
      <Shift on={on} delay={1.75} dy={-5}>
        <path d="M109,99 v-6 a7,7 0 0 1 14,0 v6" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      </Shift>
      <rect x={104} y={98} width={24} height={18} rx={4} fill={INK} stroke={PAPER} strokeWidth={3} />
      <circle cx={116} cy={107} r={2.2} fill={BLUE} />
    </Pop>
    <Burst on={on} cx={116} cy={96} r1={16} r2={22} n={6} delay={1.8} />
  </Stage>
);

const Profile = ({ on }: On) => (
  <Stage on={on}>
    <Pop on={on} from={1} delay={0.05}>
      <rect x={26} y={20} width={108} height={110} rx={10} fill={PAPER} />
    </Pop>
    <Line on={on} delay={0.05} dur={0.8} d="M36,20 h88 a10,10 0 0 1 10,10 v90 a10,10 0 0 1 -10,10 h-88 a10,10 0 0 1 -10,-10 v-90 a10,10 0 0 1 10,-10 z" />
    <Line on={on} delay={0.5} dur={0.4} d="M39,38 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0" />
    <Line on={on} delay={0.7} dur={0.35} o={0.7} d="M60,35 h34" />
    <Line on={on} delay={0.8} dur={0.3} o={0.35} d="M60,42 h22" />
    <Pop on={on} from={0.9} y={10} delay={0.9}>
      <rect x={36} y={54} width={58} height={40} rx={5} fill="rgba(37,99,235,0.16)" />
    </Pop>
    <Line on={on} delay={1.1} dur={0.5} color={BLUE} w={2} d="M50,84 v-12 l15,-11 l15,11 v12" />
    <Pop on={on} from={0.9} y={10} delay={1.05}>
      <rect x={100} y={54} width={24} height={18} rx={4} fill="rgba(6,20,46,0.07)" />
    </Pop>
    <Line on={on} delay={1.25} dur={0.35} color={BLUE} w={1.75} d="M108,63 a4,4 0 1 0 8,0 a4,4 0 1 0 -8,0" />
    <Pop on={on} from={0.9} y={10} delay={1.2}>
      <rect x={100} y={76} width={24} height={18} rx={4} fill="rgba(6,20,46,0.07)" />
    </Pop>
    <Line on={on} delay={1.4} dur={0.35} color={BLUE} w={1.75} d="M114,79 l-6,8 h7 l-4,6" />
    <Pop on={on} delay={1.4} y={6}>
      <rect x={36} y={100} width={24} height={10} rx={5} stroke={INK} strokeOpacity={0.35} strokeWidth={1.25} />
      <circle cx={43} cy={105} r={2} fill={BLUE} />
    </Pop>
    <Pop on={on} delay={1.5} y={6}>
      <rect x={64} y={100} width={20} height={10} rx={5} stroke={INK} strokeOpacity={0.35} strokeWidth={1.25} />
      <circle cx={71} cy={105} r={2} fill={BLUE} />
    </Pop>
    <Pop on={on} delay={1.6} y={6}>
      <rect x={88} y={100} width={28} height={10} rx={5} stroke={INK} strokeOpacity={0.35} strokeWidth={1.25} />
      <circle cx={95} cy={105} r={2} fill={BLUE} />
    </Pop>
    <Line on={on} delay={0.9} dur={0.4} color={INK} w={4} o={0.1} d="M36,121 h88" />
    <Line on={on} delay={1.7} dur={0.9} color={BLUE} w={4} d="M36,121 h72" />
  </Stage>
);

const Verify = ({ on }: On) => (
  <Stage on={on}>
    <g transform="rotate(-9 46 76)">
      <Pop on={on} from={1} x={-20} delay={0.1}>
        <rect x={16} y={54} width={60} height={44} rx={6} fill={PAPER} stroke={INK} strokeWidth={1.5} />
        <circle cx={32} cy={72} r={7} stroke={INK} strokeWidth={1.5} />
        <path d="M46,68 h22 M46,76 h16 M24,88 h44" stroke={INK} strokeOpacity={0.4} strokeWidth={1.5} strokeLinecap="round" />
      </Pop>
    </g>
    <Pop on={on} from={1} delay={0.5}>
      <path d="M88,20 L124,32 V70 C124,96 108,114 88,124 C68,114 52,96 52,70 V32 Z" fill={PAPER} />
    </Pop>
    <Line on={on} delay={0.5} dur={0.9} d="M88,20 L124,32 V70 C124,96 108,114 88,124 C68,114 52,96 52,70 V32 Z" />
    <Line on={on} delay={1.3} dur={0.5} color={BLUE} w={3.5} d="M72,72 L84,84 L106,58" />
    <Ring on={on} cx={88} cy={74} r={34} delay={1.6} />
    <Burst on={on} cx={88} cy={74} r1={44} r2={52} n={10} delay={1.65} />
  </Stage>
);

const Discover = ({ on }: On) => (
  <Stage on={on}>
    <Pop on={on} from={1} delay={0.05}>
      <rect x={22} y={22} width={116} height={104} rx={10} fill={PAPER} />
    </Pop>
    <Line on={on} delay={0.05} dur={0.8} d="M32,22 h96 a10,10 0 0 1 10,10 v84 a10,10 0 0 1 -10,10 h-96 a10,10 0 0 1 -10,-10 v-84 a10,10 0 0 1 10,-10 z" />
    <Line on={on} delay={0.4} dur={0.5} o={0.22} w={1.25} d="M22,58 H138" />
    <Line on={on} delay={0.5} dur={0.5} o={0.22} w={1.25} d="M22,92 H138" />
    <Line on={on} delay={0.6} dur={0.5} o={0.22} w={1.25} d="M60,22 V126" />
    <Line on={on} delay={0.7} dur={0.5} o={0.22} w={1.25} d="M104,22 V126" />
    <Ring on={on} cx={80} cy={96} r={14} squash={0.35} delay={1.0} loop />
    <Ring on={on} cx={80} cy={96} r={14} squash={0.35} delay={1.8} loop />
    <Pop on={on} from={1} y={-46} origin="50% 100%" delay={0.8}>
      <path d="M80,96 c-14,-16 -18,-24 -18,-32 a18,18 0 0 1 36,0 c0,8 -4,16 -18,32 z" fill={BLUE} stroke={INK} strokeWidth={1.75} strokeLinejoin="round" />
      <circle cx={80} cy={64} r={6} fill={PAPER} />
    </Pop>
    <Pop on={on} from={0} delay={1.3}><circle cx={38} cy={44} r={4} fill={BLUE} /></Pop>
    <Line on={on} delay={1.4} dur={0.4} color={BLUE} w={1.25} o={0.6} d="M42,47 L64,58" />
    <Pop on={on} from={0} delay={1.5}><circle cx={122} cy={46} r={4} fill={BLUE} /></Pop>
    <Line on={on} delay={1.6} dur={0.4} color={BLUE} w={1.25} o={0.6} d="M118,49 L96,60" />
    <Pop on={on} from={0} delay={1.7}><circle cx={40} cy={110} r={4} fill={BLUE} /></Pop>
    <Line on={on} delay={1.8} dur={0.4} color={BLUE} w={1.25} o={0.6} d="M44,107 L68,84" />
  </Stage>
);

const Hired = ({ on }: On) => (
  <Stage on={on}>
    <Line on={on} delay={0.05} dur={0.4} o={0.3} w={1.25} d="M30,108 H130" />
    <Line on={on} delay={0.15} dur={0.6} d="M48,68 V108 H112 V68" />
    <Line on={on} delay={0.5} dur={0.6} color={BLUE} w={2.5} d="M38,76 L80,42 L122,76" />
    <Line on={on} delay={0.9} dur={0.4} d="M72,108 V90 h16 V108" />
    <Line on={on} delay={1.0} dur={0.4} o={0.6} d="M54,80 h12 v10 h-12 z" />
    <Line on={on} delay={1.1} dur={0.4} o={0.6} d="M94,80 h12 v10 h-12 z" />
    {[48, 64, 80, 96, 112].map((cx, i) => (
      <Pop key={cx} on={on} from={0} delay={1.2 + i * 0.1}>
        <path d={star(cx, 24, 7.5)} fill={BLUE} stroke={BLUE} strokeWidth={1} strokeLinejoin="round" />
      </Pop>
    ))}
    <Pop on={on} from={0} delay={1.8}>
      <circle cx={128} cy={46} r={10} fill={BLUE} />
    </Pop>
    <Line on={on} delay={1.95} dur={0.25} color={PAPER} w={2.2} d="M123,46 l4,4 l7,-8" />
    <Burst on={on} cx={128} cy={46} r1={15} r2={21} n={8} delay={1.95} />
  </Stage>
);

type Milestone = {
  number: string;
  title: string;
  note: string;
  Scene: React.FC<On>;
};

const milestones: Milestone[] = [
  { number: "01", title: "Register", note: "A standard account. Free, no role required.", Scene: Register },
  { number: "02", title: "Become a professional", note: "Unlock the professional tools. Same account.", Scene: Pro },
  { number: "03", title: "Build your profile", note: "Skills, services, portfolio, proof of work.", Scene: Profile },
  { number: "04", title: "Get verified", note: "Submit your details. Earn the badge.", Scene: Verify },
  { number: "05", title: "Get discovered", note: "Appear in local searches by trade and city.", Scene: Discover },
  { number: "06", title: "Get hired", note: "Complete work. Build your reputation.", Scene: Hired },
];

const FeaturedProps: React.FC = () => {
  const reduce = useReducedMotion();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<SVGPathElement>(null);
  const userMoved = useRef(false);

  const inView = useInView(scrollerRef, { once: true, amount: 0.35 });

  const progress = useMotionValue(0);
  const tx = useMotionValue(pct(PTS[0].x, W));
  const ty = useMotionValue(pct(PTS[0].y, H));
  const pathOpacity = useTransform(progress, [0, 0.004], [0, 1]);

  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);

  useMotionValueEvent(progress, "change", (v) => {
    const path = measureRef.current;
    if (path) {
      const p = path.getPointAtLength(v * path.getTotalLength());
      tx.set(pct(p.x, W));
      ty.set(pct(p.y, H));
    }
    const idx = Math.min(5, Math.floor(v * 5 + 0.02));
    setActive((a) => (idx < a ? a : idx));
  });

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      progress.set(1);
      setActive(5);
      setDone(true);
      return;
    }

    progress.set(0);
    setActive(-1);
    setDone(false);

    const kick = window.setTimeout(() => setActive(0), 450);
    const controls = animate(progress, VALUES, {
      duration: TOTAL,
      times: TIMES,
      ease: EASES,
      delay: 0.45,
      onComplete: () => setDone(true),
    });

    return () => {
      window.clearTimeout(kick);
      controls.stop();
    };
  }, [inView, run, reduce, progress]);

  useEffect(() => {
    const s = scrollerRef.current;
    const root = rootRef.current;
    if (!s || !root || active < 0 || userMoved.current) return;
    if (s.scrollWidth <= s.clientWidth + 2) return;
    const target = ((active + 0.5) / 6) * root.offsetWidth - s.clientWidth / 2;
    s.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  const replay = () => {
    userMoved.current = false;
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    setRun((r) => r + 1);
  };

  const t = (d: number, delay = 0) =>
    reduce ? { duration: 0 } : { duration: d, delay, ease };

  return (
    <section
      id="professionals"
      className="relative overflow-hidden bg-[#f8fafc] py-28 lg:py-40 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400"
        >
          <span>03 / Professionals</span>
          <span>For the trades</span>
        </motion.div>

        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.15, ease }}
          style={{ transformOrigin: "left" }}
          className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800"
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="max-w-[14ch] text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            From account to hired.
          </motion.h2>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.35, ease }}
          >
            <p className="max-w-[46ch] text-[17px] leading-8 text-slate-600 dark:text-slate-300">
              Every professional on SkilledLink starts the same way. A standard
              account, no roles, no labels. When you are ready, you unlock the
              professional tools, build your profile, and get found by
              customers near you.
            </p>
            <Link
              to="/onboarding"
              className="mt-8 inline-block text-[15px] text-blue-600 underline decoration-blue-600/30 decoration-1 underline-offset-[7px] transition-colors duration-200 hover:decoration-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400 dark:focus-visible:outline-blue-400"
            >
              Start the path
            </Link>
          </motion.div>
        </div>

        <div
          ref={scrollerRef}
          onPointerDown={() => (userMoved.current = true)}
          onWheel={() => (userMoved.current = true)}
          className="-mx-6 mt-20 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mt-28 xl:mx-0 xl:overflow-visible xl:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div ref={rootRef} className="relative min-w-[1040px] overflow-hidden py-2">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-[380px]"
              style={{
                left: tx,
                x: "-50%",
                background:
                  "radial-gradient(closest-side, rgba(37,99,235,0.17), rgba(37,99,235,0))",
              }}
              initial={false}
              animate={{ opacity: active >= 0 && !done ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />

            <div aria-hidden="true" className="relative grid grid-cols-6 items-end">
              {milestones.map((m, i) => (
                <div key={m.number} className="flex justify-center px-2">
                  {/* Paper card keeps illustrations readable on dark */}
                  <div className="w-full rounded-md bg-white/0 p-2 dark:bg-white/[0.04]">
                    <m.Scene on={active >= i} />
                  </div>
                </div>
              ))}
            </div>

            <div aria-hidden="true" className="relative aspect-[10/1] w-full">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                fill="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <path
                  ref={measureRef}
                  d={PATH_D}
                  stroke={BLUE}
                  strokeOpacity={0.2}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <motion.path
                  d={PATH_D}
                  stroke={BLUE}
                  strokeOpacity={0.16}
                  strokeWidth={10}
                  strokeLinecap="round"
                  style={{ pathLength: progress, opacity: pathOpacity }}
                />
                <motion.path
                  d={PATH_D}
                  stroke={BLUE}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  style={{ pathLength: progress, opacity: pathOpacity }}
                />
              </svg>

              {PTS.map((p, i) => {
                const on = active >= i;
                const dotTop = pct(p.y, H);
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full w-0"
                    style={{ left: pct(p.x, W) }}
                  >
                    <motion.span
                      className="absolute left-0 top-0 w-0 origin-top border-l border-dashed border-blue-600/50 dark:border-blue-400/50"
                      style={{ height: dotTop }}
                      initial={false}
                      animate={{ scaleY: on ? 1 : 0 }}
                      transition={t(0.6, 0.1)}
                    />
                    <motion.span
                      className="absolute left-0 h-5 w-5 rounded-full border border-blue-600/45 dark:border-blue-400/45"
                      style={{ top: dotTop, x: "-50%", y: "-50%" }}
                      initial={false}
                      animate={{ scale: on ? 1 : 0.4, opacity: on ? 1 : 0 }}
                      transition={t(0.5, 0.1)}
                    />
                    <motion.span
                      className="absolute left-0 h-2.5 w-2.5 rounded-full"
                      style={{ top: dotTop, x: "-50%", y: "-50%" }}
                      initial={false}
                      animate={
                        on
                          ? { scale: reduce ? 1 : [0, 1.7, 1], backgroundColor: BLUE }
                          : { scale: 1, backgroundColor: "rgba(37,99,235,0.25)" }
                      }
                      transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                    {i === 5 && active === 5 && !reduce && (
                      <motion.span
                        className="absolute left-0 h-5 w-5 rounded-full border border-blue-600 dark:border-blue-400"
                        style={{ top: dotTop, x: "-50%", y: "-50%" }}
                        initial={{ scale: 0.3, opacity: 0.9 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 1.6, delay: 0.5, ease: "easeOut" }}
                      />
                    )}
                  </div>
                );
              })}

              <motion.span
                className="pointer-events-none absolute z-10 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-[#f8fafc] dark:bg-blue-400 dark:ring-slate-950"
                style={{ left: tx, top: ty, x: "-50%", y: "-50%" }}
                initial={false}
                animate={{ opacity: active >= 0 && !done ? 1 : 0, scale: done ? 0.4 : 1 }}
                transition={{ duration: 0.5 }}
              >
                {!reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-blue-600 dark:bg-blue-400"
                    animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.span>
            </div>

            <ol className="mt-8 grid grid-cols-6">
              {milestones.map((m, i) => {
                const on = active >= i;
                return (
                  <li key={m.number} className="px-3 text-center">
                    <motion.span
                      className="block text-[11px] font-medium tabular-nums"
                      initial={false}
                      animate={{
                        color: on ? BLUE : "rgba(100,116,139,0.35)",
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {m.number}
                    </motion.span>

                    <span className="mt-2 block overflow-hidden pb-1">
                      <motion.h4
                        className="text-[17px] font-normal leading-tight text-[#06142e] dark:text-white"
                        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                        initial={false}
                        animate={{ y: on ? "0%" : "115%" }}
                        transition={t(0.8, 0.1)}
                      >
                        {m.title}
                      </motion.h4>
                    </span>

                    <motion.p
                      className="mx-auto mt-2 max-w-[22ch] text-[12.5px] leading-5 text-slate-500 dark:text-slate-400"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
                      transition={t(0.8, 0.3)}
                    >
                      {m.note}
                    </motion.p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="mt-8 h-6">
          <motion.button
            type="button"
            onClick={replay}
            initial={false}
            animate={{ opacity: done && !reduce ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            tabIndex={done && !reduce ? 0 : -1}
            className="text-[14px] text-slate-500 underline decoration-slate-300 decoration-1 underline-offset-[6px] transition-colors hover:text-[#06142e] hover:decoration-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:decoration-slate-600 dark:hover:text-white dark:hover:decoration-slate-400 dark:focus-visible:outline-blue-400"
          >
            Replay the path
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProps;