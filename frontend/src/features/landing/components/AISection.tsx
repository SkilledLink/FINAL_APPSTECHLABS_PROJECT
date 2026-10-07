// src/features/landing/components/AISection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Zap,
  MapPin,
  Star,
  BadgeCheck,
} from 'lucide-react';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import { skillImages } from '../landingData';

const ease = [0.22, 1, 0.36, 1] as const;

const REQUEST =
  'I need someone to install electrical wiring in my new house.';

const TAGS = [
  { label: 'Electrical Installation', tone: 'blue' },
  { label: 'Residential', tone: 'neutral' },
  { label: 'Douala', tone: 'neutral' },
];

const MATCHED = [
  {
    name: 'Che Rodriguez',
    role: 'Electrician',
    location: 'Douala I',
    rating: 4.9,
    reviews: 42,
    cover: skillImages.electrician,
  },
  {
    name: 'Samuel N.',
    role: 'Electrician',
    location: 'Yaoundé',
    rating: 4.8,
    reviews: 28,
    cover: skillImages.welder,
  },
];

const AISection: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section
      id="ai"
      className="relative overflow-hidden bg-[#f8fafc] py-24 lg:py-32 dark:bg-slate-950"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              05 / Understands you
            </SectionLabel>
            <span className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline-flex dark:text-slate-500">
              <Sparkles className="h-3 w-3" />
              Assisted search
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="mt-16 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          {/* Left — copy */}
          <div>
            <LineReveal
              lines={[
                'Finding the right',
                'professional shouldn’t',
                'require the right words.',
              ]}
              className="max-w-[16ch] font-normal leading-[1.04] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.2vw,3.25rem)]"
            />

            <Reveal delay={0.25}>
              <p className="mt-8 max-w-[44ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
                Describe the job the way you'd describe it to a friend.
                SkilledLink reads the intent, works out the category, and
                shows you the professionals who actually do that work.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-[12.5px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#4F8EFF]" />
                  Plain-language input
                </span>
                <span aria-hidden className="hidden h-3 w-px bg-slate-200 sm:block dark:bg-white/10" />
                <span>No filters required</span>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="mt-10">
                <Link
                  to="/home/professionals"
                  className="group inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#2563EB] transition-colors duration-300 hover:text-[#06142e] dark:text-[#4F8EFF] dark:hover:text-white"
                >
                  <span>Try it with your own job</span>
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                  >
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — interpretation visual */}
          <Reveal delay={0.2}>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[28px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.10),rgba(37,99,235,0))] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(79,142,255,0.16),rgba(79,142,255,0))]"
              />

              <div className="relative space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.28)] sm:p-5 dark:border-white/[0.08] dark:bg-[#01306e] dark:shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]">
                {/* The request bubble */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, ease }}
                  className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50/70 px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.04]"
                >
                  <p className="text-[13.5px] leading-6 text-slate-700 dark:text-slate-200">
                    “{REQUEST}”
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    <Sparkles className="h-3 w-3" />
                    SkilledLink is reading it…
                  </span>
                </motion.div>

                {/* Interpretation chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {TAGS.map((tag, i) => (
                    <motion.span
                      key={tag.label}
                      initial={reduce ? false : { opacity: 0, y: 6, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{
                        duration: 0.45,
                        delay: 0.35 + i * 0.14,
                        ease,
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${
                        tag.tone === 'blue'
                          ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/25 dark:bg-[#4F8EFF]'
                          : 'border border-slate-200 text-slate-600 dark:border-white/[0.08] dark:text-slate-300'
                      }`}
                    >
                      {tag.tone === 'blue' && (
                        <Zap className="h-3 w-3" strokeWidth={2.5} />
                      )}
                      {tag.label}
                    </motion.span>
                  ))}
                </div>

                {/* Divider */}
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                      Matched professionals
                    </span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
                    <span className="text-[10.5px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                      {MATCHED.length}
                    </span>
                  </div>
                </div>

                {/* Matched pros */}
                <div className="space-y-2.5">
                  {MATCHED.map((pro, i) => (
                    <motion.div
                      key={pro.name}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.85 + i * 0.14,
                        ease,
                      }}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]"
                    >
                      <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10">
                        <img
                          src={pro.cover}
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
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {pro.location}
                          </span>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            <span className="tabular-nums">{pro.rating}</span>
                            <span className="text-slate-400 dark:text-slate-500">
                              ({pro.reviews})
                            </span>
                          </span>
                        </div>
                      </div>

                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default AISection;