// src/features/landing/components/HeroProductVisual.tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  ArrowUpRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const QUERY = 'electrician';

interface Pro {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  reviews: number;
  verified?: boolean;
  available?: boolean;
  /** Gradient seed for the avatar fallback */
  gradient: string;
  highlight?: boolean;
}

const PROS: Pro[] = [
  {
    id: 'p1',
    name: 'Che Rodriguez',
    role: 'Electrician',
    location: 'Douala I, Littoral, Cameroon',
    rating: 4.9,
    reviews: 42,
    verified: true,
    available: true,
    gradient: 'from-slate-700 to-slate-900',
    highlight: true,
  },
  {
    id: 'p2',
    name: 'Che Rodriguez',
    role: 'Electrician',
    location: 'Douala I, Littoral, Cameroon',
    rating: 4.8,
    reviews: 28,
    available: true,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'p3',
    name: 'Demanou Princesse',
    role: 'Plumber',
    location: 'Douala I, Littoral, Cameroon',
    rating: 4.9,
    reviews: 51,
    verified: true,
    available: true,
    gradient: 'from-violet-500 to-fuchsia-600',
  },
];

type Stage = 'typing' | 'loading' | 'results' | 'selected' | 'preview';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function HeroProductVisual() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState('');
  const [stage, setStage] = useState<Stage>('typing');

  useEffect(() => {
    if (reduce) {
      setTyped(QUERY);
      setStage('preview');
      return;
    }

    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        setTyped('');
        setStage('typing');
        await wait(700);

        for (let i = 0; i <= QUERY.length; i++) {
          if (cancelled) return;
          setTyped(QUERY.slice(0, i));
          await wait(85);
        }

        await wait(220);
        if (cancelled) return;
        setStage('loading');
        await wait(800);
        if (cancelled) return;
        setStage('results');
        await wait(1200);
        if (cancelled) return;
        setStage('selected');
        await wait(700);
        if (cancelled) return;
        setStage('preview');
        await wait(4200);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  const showResults =
    stage === 'results' || stage === 'selected' || stage === 'preview';

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      {/* Soft ambient glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[32px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.18),rgba(37,99,235,0))] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(79,142,255,0.24),rgba(79,142,255,0))]"
      />

      {/* Card */}
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_32px_80px_-36px_rgba(15,23,42,0.32)] dark:border-white/[0.08] dark:bg-[#01306e] dark:shadow-[0_32px_80px_-36px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 dark:border-white/[0.06]">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              SkilledLink
            </span>
            <h3 className="mt-1.5 text-[19px] font-bold leading-tight tracking-tight text-[#06142e] dark:text-white">
              Find a professional
            </h3>
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
              Search by profession, skill, service, or location.
            </p>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        {/* Search field */}
        <div className="px-6 pt-5">
          <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white transition-[border-color,box-shadow] duration-200 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <Search className="ml-4 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="min-w-0 flex-1 truncate px-3 py-3.5 text-[14px] font-medium text-slate-800 dark:text-slate-100">
              {typed || (
                <span className="text-slate-400 dark:text-slate-500">
                  Search professionals…
                </span>
              )}
              {stage === 'typing' && !reduce && (
                <motion.span
                  aria-hidden
                  className="ml-[1px] inline-block h-[15px] w-[1.5px] translate-y-[2px] bg-slate-700 align-middle dark:bg-slate-200"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    times: [0, 0.5, 0.5, 1],
                  }}
                />
              )}
            </span>

            {/* Blue search button */}
            <button
              type="button"
              tabIndex={-1}
              className="mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm shadow-blue-600/25 dark:bg-[#4F8EFF]"
            >
              {stage === 'loading' ? (
                <span className="h-4 w-4 animate-spin rounded-full border-[1.75px] border-white/40 border-t-white" />
              ) : (
                <Search className="h-4 w-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-baseline justify-between gap-3 px-6 pt-5 pb-3">
          <h4 className="text-[15px] font-bold tracking-tight text-[#06142e] dark:text-white">
            Professionals
          </h4>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {showResults ? `${PROS.length} results` : 'Searching…'}
          </span>
        </div>

        {/* Results list */}
        <div className="space-y-2.5 px-6 pb-5">
          {PROS.map((pro, i) => {
            const selected =
              !!pro.highlight &&
              (stage === 'selected' || stage === 'preview');

            return (
              <motion.div
                key={pro.id}
                initial={false}
                animate={
                  showResults ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                }
                transition={{
                  duration: 0.45,
                  delay: showResults ? i * 0.1 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-300 dark:bg-white/[0.03] ${
                  selected
                    ? 'border-blue-500/50 shadow-[0_12px_30px_-14px_rgba(37,99,235,0.45)] ring-2 ring-blue-500/15 dark:border-blue-400/40 dark:ring-blue-400/20'
                    : 'border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {/* Top-right arrow */}
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-slate-300 dark:text-slate-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>

                {/* Main row */}
                <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${pro.gradient} text-[13px] font-bold text-white shadow-sm`}
                    >
                      {pro.name
                        .split(' ')
                        .map((w) => w.charAt(0))
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    {pro.available && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-[#01306e]" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1 pr-6">
                    {/* Name + verified */}
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-bold text-[#06142e] dark:text-white">
                        {pro.name}
                      </span>
                      {pro.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
                      )}
                    </div>

                    {/* Role */}
                    <p className="mt-0.5 text-[12.5px] font-semibold text-[#2563EB] dark:text-[#4F8EFF]">
                      {pro.role}
                    </p>

                    {/* Location */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{pro.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="mt-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-slate-700 dark:text-slate-200">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{pro.rating.toFixed(1)}</span>
                      <span className="ml-0.5 font-normal text-slate-400 dark:text-slate-500">
                        ({pro.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer strip */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  {pro.available ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Available for work
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Unavailable
                    </span>
                  )}

                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-[11.5px] font-semibold text-slate-500 transition-colors hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#4F8EFF]"
                  >
                    View profile
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview panel — slides up when a pro is selected */}
        <AnimatePresence initial={false}>
          {stage === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-slate-100 dark:border-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 to-transparent px-6 py-4 dark:from-blue-500/[0.08] dark:to-transparent">
                <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
                  <span className="truncate">
                    Verified · {PROS[0].reviews} jobs completed
                  </span>
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 py-2 text-[11.5px] font-bold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-[#1d4ed8] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                >
                  Request service
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}