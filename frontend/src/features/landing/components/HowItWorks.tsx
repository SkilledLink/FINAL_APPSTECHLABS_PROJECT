// src/features/landing/components/HowItWorks.tsx
import React, { useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  ArrowRight,
  Send,
  ShieldCheck,
} from 'lucide-react';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: '01',
    title: 'Tell us what you need.',
    body: 'Type a service, a trade, or a location. SkilledLink reads plain language and finds the right professionals for the job.',
  },
  {
    n: '02',
    title: 'Compare professionals.',
    body: 'See skills, experience, ratings, and completed work. Read a profile before you ever make contact.',
  },
  {
    n: '03',
    title: 'Connect directly.',
    body: 'Start a conversation, share details of the job, and request the service. No middlemen, no back-and-forth.',
  },
];

const PROS = [
  {
    name: 'Che Rodriguez',
    role: 'Electrician',
    location: 'Douala I, Littoral',
    rating: 4.9,
    reviews: 42,
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    name: 'Demanou P.',
    role: 'Plumber',
    location: 'Douala I, Littoral',
    rating: 4.9,
    reviews: 51,
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    name: 'Samuel N.',
    role: 'Electrician',
    location: 'Yaoundé',
    rating: 4.8,
    reviews: 28,
    gradient: 'from-blue-500 to-indigo-600',
  },
];

/** Work photos for step 2 — one per pro, same order as PROS */
const EXPLORE_COVERS = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Ouvrier%20travaux%20publics%2019.jpg?width=400',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cameroon%20male%20plumbier%20at%20work%2001.jpg?width=400',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Carpenter%20at%20work%201.jpg?width=400',
];

const HowItWorks: React.FC = () => {
  const reduce = useReducedMotion();

  const ref0 = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const refs = [ref0, ref1, ref2];

  const in0 = useInView(ref0, { margin: '-40% 0px -40% 0px' });
  const in1 = useInView(ref1, { margin: '-40% 0px -40% 0px' });
  const in2 = useInView(ref2, { margin: '-40% 0px -40% 0px' });
  const active = in2 ? 2 : in1 ? 1 : in0 ? 0 : 0;

  return (
    <section
      id="how"
      className="relative bg-[#f8fafc] py-20 lg:py-24 dark:bg-slate-950"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              02 / How it works
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline dark:text-slate-500">
              Three steps
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
          <div style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
            <LineReveal
              lines={['From a search', 'to a request.']}
              className="max-w-[16ch] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.5vw,3.5rem)]"
            />
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-[44ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
              SkilledLink is built around one simple loop: tell us what you
              need, compare the professionals who match, and connect directly
              with the one you choose.
            </p>
          </Reveal>
        </div>

        {/* Steps + sticky visual */}
        <div className="mt-14 flex flex-col gap-10 lg:mt-20 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          {/* Steps column */}
          <div className="order-2 lg:order-1">
            {STEPS.map((step, i) => {
              const isActive = active === i;
              return (
                <div
                  key={step.n}
                  ref={refs[i]}
                  className="min-h-[40vh] border-t border-slate-200 py-8 first:border-t-0 first:pt-0 lg:min-h-[52vh] lg:py-10 dark:border-slate-800"
                >
                  <motion.span
                    className="block text-[11px] font-medium tabular-nums"
                    animate={{ color: isActive ? '#2563EB' : '#94a3b8' }}
                    transition={{ duration: 0.35 }}
                  >
                    {step.n}
                  </motion.span>

                  <h3
                    className="mt-3 max-w-[16ch] font-normal leading-[1.1] tracking-[-0.03em] text-[#06142e] dark:text-white text-[clamp(1.5rem,2.6vw,2rem)]"
                    style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                  >
                    {step.title}
                  </h3>

                  <p className="mt-4 max-w-[42ch] text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Sticky visual column */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <VisualStage active={active} reduce={!!reduce} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ============================================================
   VISUAL STAGE
   ============================================================ */

function VisualStage({ active, reduce }: { active: number; reduce: boolean }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[28px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.10),rgba(37,99,235,0))] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(79,142,255,0.16),rgba(79,142,255,0))]"
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_28px_70px_-32px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#01306e] dark:shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            SkilledLink
          </span>
          <div className="w-8" />
        </div>

        {/* Stage body */}
        <div className="relative min-h-[300px] p-5">
          <AnimatePresence mode="wait" initial={false}>
            {active === 0 && <SearchView key="s" reduce={reduce} />}
            {active === 1 && <ExploreView key="e" reduce={reduce} />}
            {active === 2 && <ConnectView key="c" reduce={reduce} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const stageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease },
};

/* ── STEP 1 · SEARCH ─────────────────────────────────────── */

function SearchView({ reduce }: { reduce: boolean }) {
  return (
    <motion.div {...stageMotion}>
      <h4 className="text-[15px] font-semibold tracking-tight text-[#06142e] dark:text-white">
        What do you need done?
      </h4>
      <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
        Describe the job, or search by trade and city.
      </p>

      <div className="mt-4 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.04]">
        <Search className="ml-4 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        <span className="min-w-0 flex-1 truncate px-3 py-3 text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
          electrician for home installation
          {!reduce && (
            <motion.span
              className="ml-[1px] inline-block h-[14px] w-[1.5px] translate-y-[2px] bg-slate-700 align-middle dark:bg-slate-200"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                times: [0, 0.5, 0.5, 1],
              }}
            />
          )}
        </span>
        <button
          type="button"
          tabIndex={-1}
          className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white dark:bg-[#4F8EFF]"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['Electrician', 'Plumber', 'Carpenter', 'Douala', 'Yaoundé'].map(
          (chip) => (
            <span
              key={chip}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11.5px] font-medium text-slate-600 dark:border-white/[0.08] dark:text-slate-300"
            >
              {chip}
            </span>
          ),
        )}
      </div>
    </motion.div>
  );
}

/* ── STEP 2 · EXPLORE ────────────────────────────────────── */

function ExploreView({ reduce }: { reduce: boolean }) {
  return (
    <motion.div {...stageMotion}>
      <div className="flex items-baseline justify-between">
        <h4 className="text-[15px] font-semibold tracking-tight text-[#06142e] dark:text-white">
          Professionals
        </h4>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {PROS.length} results
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {PROS.map((pro, i) => (
          <motion.div
            key={pro.name}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease }}
            className={`flex items-center gap-3 overflow-hidden rounded-xl border bg-white p-2.5 pr-3.5 dark:bg-white/[0.03] ${
              i === 0
                ? 'border-blue-500/40 ring-2 ring-blue-500/10 dark:border-blue-400/40 dark:ring-blue-400/20'
                : 'border-slate-200 dark:border-white/[0.06]'
            }`}
          >
            {/* Work photo */}
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10">
              <img
                src={EXPLORE_COVERS[i]}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13px] font-semibold text-[#06142e] dark:text-white">
                  {pro.name}
                </span>
                <BadgeCheck className="h-3 w-3 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
              </div>
              <p className="mt-0.5 text-[11.5px] font-semibold text-[#2563EB] dark:text-[#4F8EFF]">
                {pro.role}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{pro.location}</span>
                <span aria-hidden>·</span>
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">{pro.rating}</span>
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({pro.reviews})
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── STEP 3 · CONNECT ────────────────────────────────────── */

function ConnectView({ reduce }: { reduce: boolean }) {
  return (
    <motion.div {...stageMotion}>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5 dark:border-white/[0.06]">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white">
          CR
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#01306e]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-[#06142e] dark:text-white">
              Che Rodriguez
            </span>
            <BadgeCheck className="h-3 w-3 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Online now
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
          className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#2563EB] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white dark:bg-[#4F8EFF]"
        >
          Hi — I need help wiring a new build. Two floors, 4 rooms per floor.
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease }}
          className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-slate-700 dark:border-white/[0.06] dark:bg-white/[0.05] dark:text-slate-200"
        >
          Got it. I can come by Saturday morning to look at the layout and give
          you a quote. Does 9am work?
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7, ease }}
        className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.03]"
      >
        <span className="flex-1 truncate text-[12.5px] text-slate-400 dark:text-slate-500">
          Write a message…
        </span>
        <button
          type="button"
          tabIndex={-1}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white dark:bg-[#4F8EFF]"
        >
          <Send className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </motion.div>

      <motion.button
        type="button"
        tabIndex={-1}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9, ease }}
        className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-blue-600/25 dark:bg-[#4F8EFF]"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Request service
        <ArrowRight className="h-3 w-3" />
      </motion.button>
    </motion.div>
  );
}

export default HowItWorks;