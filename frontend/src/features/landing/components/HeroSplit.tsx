// src/features/landing/components/HeroSplit.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Star, MapPin } from 'lucide-react';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import HeroProductVisual from './HeroProductVisual';
import { heroImage } from '../landingData';

/** Matches TopNav's floating pill: top offset + pill height + breathing room */
const SCROLL_ANCHOR = 12 + 60 + 16;

const HeroSplit: React.FC = () => {
  const scrollToHow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('how');
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - SCROLL_ANCHOR;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#fafafa] dark:bg-[#011c44]"
    >
      {/* ── Background image ─────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      {/* ── Branded wash ─────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(250,250,250,0.90)_0%,rgba(250,250,250,0.72)_38%,rgba(250,250,250,0.55)_65%,rgba(250,250,250,0.68)_100%)] dark:bg-[linear-gradient(115deg,rgba(1,28,68,0.94)_0%,rgba(1,28,68,0.82)_38%,rgba(1,28,68,0.62)_65%,rgba(1,28,68,0.78)_100%)]"
      />

      {/* Soft brand atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 12% 8%, rgba(37,99,235,0.10), transparent 60%), radial-gradient(ellipse 50% 42% at 92% 96%, rgba(79,142,255,0.10), transparent 65%)',
        }}
      />

      {/* Hairline grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 85%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col-reverse gap-14 px-5 pt-32 pb-20 sm:px-8 sm:pt-36 sm:pb-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-44 lg:pb-32">
        {/* ── LEFT · Copy ───────────────────────────────── */}
        <div className="max-w-[640px]">
          {/* Eyebrow */}
          <Reveal>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 backdrop-blur-sm dark:border-white/[0.10] dark:bg-white/[0.06]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] shadow-[0_0_10px_rgba(37,99,235,0.6)] dark:bg-[#4F8EFF]" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-300">
                Skilled people. Real services.
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <LineReveal
            trigger="mount"
            delay={0.15}
            lines={[
              'Find the right',
              'professional for the job.',
            ]}
            className="mt-8 font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2.25rem,5.6vw,4.25rem)]"
          />

          {/* Subtext */}
          <Reveal delay={0.35}>
            <p className="mt-7 max-w-[52ch] text-[16.5px] leading-8 text-slate-700 dark:text-slate-300">
              SkilledLink helps you discover, evaluate, and connect with
              skilled professionals — from electricians and plumbers to
              carpenters and welders — across Cameroon.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.5}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/home/professionals"
                className="group inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_10px_28px_-12px_rgba(37,99,235,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_16px_36px_-14px_rgba(37,99,235,0.85)] active:translate-y-0 active:scale-[0.985] dark:bg-[#4F8EFF] dark:hover:bg-[#3d7df5]"
              >
                Find a professional
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              {/* Working "How it works" — smooth scrolls to #how */}
              <a
                href="#how"
                onClick={scrollToHow}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-6 py-3.5 text-[14.5px] font-semibold text-slate-800 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-white active:scale-[0.985] dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-white/[0.18] dark:hover:bg-white/[0.10]"
              >
                How it works
              </a>
            </div>
          </Reveal>

          {/* Trust row */}
          <Reveal delay={0.65}>
            <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-300/60 pt-6 text-[12.5px] font-medium text-slate-600 dark:border-white/[0.10] dark:text-slate-400">
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#2563EB] dark:text-[#4F8EFF]" />
                Identity-verified pros
              </span>
              <span aria-hidden className="hidden h-3 w-px bg-slate-300/80 sm:block dark:bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                4.9 average rating
              </span>
              <span aria-hidden className="hidden h-3 w-px bg-slate-300/80 sm:block dark:bg-white/10" />
              <span className="flex items-center gap-2">
                <MapPin size={13} className="text-[#2563EB] dark:text-[#4F8EFF]" />
                Across 6 major cities
              </span>
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT · Product visual ───────────────────── */}
        <div className="relative">
          <HeroProductVisual />
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;