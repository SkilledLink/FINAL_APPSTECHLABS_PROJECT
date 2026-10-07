// src/features/landing/components/ForProfessionals.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BadgeCheck,
  MapPin,
  Star,
  ArrowRight,
  Eye,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import Stagger from '../../../components/motion/Stagger';
import { skillImages } from '../landingData';

const ease = [0.22, 1, 0.36, 1] as const;

const BENEFITS = [
  {
    title: 'Showcase your skills',
    body: 'List what you do, your years of experience, and the services you offer.',
  },
  {
    title: 'Present your work',
    body: 'Add photos and details of completed jobs so clients can see your standard.',
  },
  {
    title: 'Reach new customers',
    body: 'Appear in searches by trade and city — not just in the groups you already know.',
  },
  {
    title: 'Build a professional presence',
    body: 'Ratings, reviews, and a shareable profile that speaks for you before you do.',
  },
];

const WORK_STRIP = [
  skillImages.electrician,
  skillImages.builder,
  skillImages.welder,
];

const ForProfessionals: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section
      id="for-professionals"
      className="relative overflow-hidden bg-[#fafafa] py-24 lg:py-32 dark:bg-[#011c44]"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              06 / For professionals
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline dark:text-slate-500">
              Grow your work
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="mt-16 grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          {/* Left — copy + benefits */}
          <div>
            <LineReveal
              lines={['Your skills', 'deserve to be', 'discovered.']}
              className="max-w-[14ch] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.4vw,3.5rem)] [font-family:'Fraunces',Georgia,serif]"
            />

            <Reveal delay={0.25}>
              <p className="mt-8 max-w-[46ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
                SkilledLink gives skilled professionals a proper place to show
                their work — and the customers to match. No agency, no
                gatekeepers, no middleman on your earnings.
              </p>
            </Reveal>

            <Stagger className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.title} className="reveal">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB] dark:bg-[#4F8EFF]" />
                    <h3 className="text-[14px] font-bold tracking-tight text-[#06142e] dark:text-white">
                      {b.title}
                    </h3>
                  </div>
                  <p className="mt-2 pl-4 text-[13px] leading-6 text-slate-600 dark:text-slate-300">
                    {b.body}
                  </p>
                </div>
              ))}
            </Stagger>

            <Reveal delay={0.35}>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_10px_26px_-12px_rgba(37,99,235,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
                >
                  Create your profile
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/home/professionals"
                  className="text-[13px] font-semibold text-slate-600 underline decoration-slate-300 decoration-1 underline-offset-[6px] transition-colors hover:text-[#06142e] hover:decoration-slate-500 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-white dark:hover:decoration-slate-400"
                >
                  See other profiles
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — profile dashboard visual */}
          <Reveal delay={0.2}>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease }}
              className="relative"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[28px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.10),rgba(37,99,235,0))] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(79,142,255,0.16),rgba(79,142,255,0))]"
              />

              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_32px_80px_-36px_rgba(15,23,42,0.30)] dark:border-white/[0.08] dark:bg-[#01306e] dark:shadow-[0_32px_80px_-36px_rgba(0,0,0,0.95)]">
                {/* Cover */}
                <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                  <img
                    src={skillImages.builder}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-[#06142e] shadow-sm backdrop-blur dark:bg-[#01306e]/90 dark:text-white">
                    <Eye className="h-3 w-3" />
                    Public profile
                  </span>
                </div>

                {/* Identity */}
                <div className="px-5 pb-5">
                  <div className="-mt-9 flex items-end gap-3.5">
                    <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-slate-100 shadow-md dark:border-[#01306e] dark:bg-white/10">
                      <img
                        src={skillImages.electrician}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-[16px] font-bold tracking-tight text-[#06142e] dark:text-white">
                          Che Rodriguez
                        </h3>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
                      </div>
                      <p className="mt-0.5 text-[12.5px] font-semibold text-[#2563EB] dark:text-[#4F8EFF]">
                        Electrician · 8 years
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    Douala I, Littoral
                    <span aria-hidden>·</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                      4.9
                    </span>
                    <span>(42 reviews)</span>
                  </div>

                  {/* Stats */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    <Stat
                      icon={<Briefcase className="h-3.5 w-3.5" />}
                      value="128"
                      label="Jobs done"
                    />
                    <Stat
                      icon={<Eye className="h-3.5 w-3.5" />}
                      value="2.4k"
                      label="Profile views"
                    />
                    <Stat
                      icon={<MessageSquare className="h-3.5 w-3.5" />}
                      value="86"
                      label="Conversations"
                    />
                  </div>

                  {/* Work strip */}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                        Recent work
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">
                        12 photos
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2">
                      {WORK_STRIP.map((src, i) => (
                        <div
                          key={i}
                          className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10"
                        >
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          {i === 2 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-semibold text-white">
                              +9
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        {icon}
      </span>
      <p className="mt-1 text-[15px] font-bold tabular-nums text-[#06142e] dark:text-white">
        {value}
      </p>
      <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default ForProfessionals;