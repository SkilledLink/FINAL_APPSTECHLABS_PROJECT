// src/features/landing/components/ProfessionalDiscovery.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import Stagger from '../../../components/motion/Stagger';
import { skillImages } from '../landingData';

interface Pro {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  reviews: number;
  jobs: number;
  tagline: string;
  cover: string;
  portrait: string;
}

const PROS: Pro[] = [
  {
    id: 'p1',
    name: 'Che Rodriguez',
    role: 'Electrician',
    location: 'Douala I, Littoral',
    rating: 4.9,
    reviews: 42,
    jobs: 128,
    tagline: 'Residential wiring, panel upgrades, and fault finding.',
    cover: skillImages.electrician,
    portrait: skillImages.electrician,
  },
  {
    id: 'p2',
    name: 'Demanou Princesse',
    role: 'Plumber',
    location: 'Douala I, Littoral',
    rating: 4.9,
    reviews: 51,
    jobs: 96,
    tagline: 'Pipework, fixtures, and emergency leak repairs.',
    cover: skillImages.plumber,
    portrait: skillImages.plumber,
  },
  {
    id: 'p3',
    name: 'Samuel N.',
    role: 'Carpenter',
    location: 'Yaoundé, Centre',
    rating: 4.8,
    reviews: 37,
    jobs: 74,
    tagline: 'Custom furniture, roofing frames, and interior fittings.',
    cover: skillImages.carpenter,
    portrait: skillImages.carpenter,
  },
];

const CATEGORIES = [
  'All',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Welder',
  'Mason',
  'Mechanic',
];

const ProfessionalDiscovery: React.FC = () => {
  return (
    <section
      id="discover"
      className="relative overflow-hidden bg-[#fafafa] py-24 lg:py-32 dark:bg-[#011c44]"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              03 / Discover
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline dark:text-slate-500">
              Search · Compare · Contact
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
          <LineReveal
            lines={['Find someone', 'worth the call.']}
            className="max-w-[16ch] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.5vw,3.5rem)] [font-family:Fraunces,Georgia,serif]"
          />
          <Reveal delay={0.2}>
            <p className="max-w-[44ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
              Search by trade, skill, or city. Every professional has a profile
              you can read — what they do, where they work, and what their
              customers say.
            </p>
          </Reveal>
        </div>

        {/* Compact search bar + chips */}
        <Reveal delay={0.25}>
          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-white/[0.04]">
              <Search className="ml-5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="min-w-0 flex-1 truncate px-3 py-3 text-[13.5px] text-slate-400 dark:text-slate-500">
                Search by profession, skill, or service…
              </span>
              <button
                type="button"
                tabIndex={-1}
                className="mr-1.5 flex h-9 items-center gap-1.5 rounded-full bg-[#2563EB] px-4 text-[12.5px] font-semibold text-white dark:bg-[#4F8EFF]"
              >
                Search
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.slice(0, 4).map((cat, i) => (
                <button
                  key={cat}
                  type="button"
                  tabIndex={-1}
                  className={`rounded-full px-3.5 py-2 text-[11.5px] font-semibold transition-colors ${
                    i === 0
                      ? 'bg-[#06142e] text-white dark:bg-white dark:text-[#06142e]'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Meta */}
        <Reveal delay={0.35}>
          <div className="mt-10 flex items-baseline justify-between">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              3 professionals near Douala
            </p>
            <span className="text-[12px] text-slate-400 dark:text-slate-500">
              Sorted by rating
            </span>
          </div>
        </Reveal>

        {/* Cards */}
        <Stagger className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROS.map((pro) => (
            <ProCard key={pro.id} pro={pro} />
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <div className="mt-12 flex justify-center">
            <Link
              to="/home/professionals"
              className="group inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#2563EB] transition-colors duration-300 hover:text-[#06142e] dark:text-[#4F8EFF] dark:hover:text-white"
            >
              <span>Browse all professionals</span>
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
      </Container>
    </section>
  );
};

/* ============================================================
   PRO CARD — image-led
   ============================================================ */

function ProCard({ pro }: { pro: Pro }) {
  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_60px_-28px_rgba(15,23,42,0.28)] dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-white/[0.12] dark:hover:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.7)]">
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
        <img
          src={pro.cover}
          alt={`${pro.name} at work`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        />

        {/* Available pill top-left */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-600 shadow-sm backdrop-blur dark:bg-[#01306e]/90 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Available
        </span>

        {/* Arrow top-right */}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur transition-all duration-300 group-hover:bg-[#2563EB] group-hover:text-white dark:bg-[#01306e]/90 dark:text-slate-200 dark:group-hover:bg-[#4F8EFF]">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {/* Portrait avatar */}
          <span className="relative -mt-10 h-12 w-12 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-slate-100 shadow-md dark:border-[#01306e] dark:bg-white/10">
            <img
              src={pro.portrait}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </span>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[15px] font-bold tracking-tight text-[#06142e] dark:text-white">
                {pro.name}
              </h3>
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#2563EB] dark:text-[#4F8EFF]" />
            </div>
            <p className="mt-0.5 text-[12.5px] font-semibold text-[#2563EB] dark:text-[#4F8EFF]">
              {pro.role}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{pro.location}</span>
        </div>

        <p className="mt-3 text-[13px] leading-6 text-slate-600 dark:text-slate-300">
          {pro.tagline}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="tabular-nums">{pro.rating.toFixed(1)}</span>
            <span className="font-normal text-slate-400 dark:text-slate-500">
              ({pro.reviews})
            </span>
          </span>
          <span aria-hidden className="h-3 w-px bg-slate-200 dark:bg-white/10" />
          <span className="text-slate-500 dark:text-slate-400">
            <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-200">
              {pro.jobs}
            </span>{' '}
            jobs completed
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/[0.06]">
        <Link
          to="/home/professionals"
          className="text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#4F8EFF]"
        >
          View profile
        </Link>
        <Link
          to="/home/professionals"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
        >
          Contact
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export default ProfessionalDiscovery;