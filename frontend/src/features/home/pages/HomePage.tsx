// src/features/home/pages/HomePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Compass,
  FolderOpen,
  Handshake,
  Heart,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Rss,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { useAuth } from '../../auth/hooks/useAuth';
import { useUser } from '../../profile/hooks/useUser';
import { useProfessional } from '../../profile/hooks/useProfessional';
import { useConversations } from '../../../hooks/useConversations';
import { useDiscoverProfessionals } from '../../location/hooks/useDiscoverProfessionals';
import { ProfileLink } from '../../profile/components/ProfileLink';

import discover_hero_image from '../../../assets/images/discover_hero_image.jpeg';

/* ═══════════════════════════════════════════════════════════════════
 * TOKENS
 * ═══════════════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const;

const CARD =
  'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800/90 dark:bg-slate-950';

const CARD_HOVER =
  'transition-all duration-300 hover:border-blue-300/70 hover:shadow-[0_2px_6px_rgba(15,23,42,0.04),0_24px_48px_-28px_rgba(37,99,235,0.32)] dark:hover:border-blue-900/70 dark:hover:shadow-[0_24px_48px_-28px_rgba(37,99,235,0.42)]';

const T = {
  primary: 'text-slate-900 dark:text-slate-50',
  secondary: 'text-slate-600 dark:text-slate-400',
  tertiary: 'text-slate-500 dark:text-slate-500',
  accent: 'text-blue-600 dark:text-blue-400',
} as const;

const GRID_PATTERN: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.10) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
};

const GRID_PATTERN_LIGHT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(100,116,139,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.07) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
};

const NOISE_PATTERN: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, delay, ease: EASE },
});

/* ═══════════════════════════════════════════════════════════════════
 * UTILITIES
 * ═══════════════════════════════════════════════════════════════════ */

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);
}

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) return setN(to);
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, reduce]);

  return <>{decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()}</>;
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || '?'
  );
}

function Avatar({
  src,
  name,
  size = 40,
  className = '',
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return src ? (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-xl object-cover ${className}`}
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-950 font-semibold text-white shadow-inner dark:from-slate-100 dark:to-slate-300 dark:text-slate-900 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * SECTION HEADER
 * ═══════════════════════════════════════════════════════════════════ */

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      {...reveal()}
      className="mb-8 flex items-end justify-between gap-6"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            <span className="h-px w-5 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-500" />
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-[22px] font-semibold tracking-tight sm:text-[27px] ${T.primary}`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2.5 text-[13.5px] leading-relaxed ${T.secondary}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="hidden shrink-0 sm:block">{action}</div>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * HERO
 * ═══════════════════════════════════════════════════════════════════ */

function StatChip({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.07] text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
        <Icon size={14} strokeWidth={2.25} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15.5px] font-semibold tabular-nums tracking-tight text-white">
          {value}
        </span>
        <span className="text-[11.5px] font-medium text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

function Hero({
  user,
  professional,
  isProfessional,
}: {
  user: any;
  professional: any;
  isProfessional: boolean;
}) {
  const navigate = useNavigate();
  const greeting = useGreeting();

  const firstName = user?.firstName ?? 'there';
  const lastName = user?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const avatar = user?.profileImageUrl;

  const followers = Number(user?.followersCount ?? 0) || 0;
  const rating = Number(professional?.rating ?? 0) || 0;
  const completedJobs = Number(professional?.completedJobs ?? 0) || 0;
  const profession = professional?.profession;
  const city = professional?.city || user?.location;
  const isVerified = professional?.isVerified;

  const tagline = isProfessional
    ? 'Match with serious clients, showcase your work, and get paid on time — every time.'
    : 'Find vetted professionals for any project. Transparent rates, escrow protection, zero guesswork.';

  const meta = [profession, city].filter(Boolean).join(' · ');

  const stats = isProfessional
    ? [
        { icon: Users, value: <CountUp to={followers} />, label: 'followers' },
        {
          icon: Star,
          value: rating ? <CountUp to={rating} decimals={1} /> : '—',
          label: 'rating',
        },
        {
          icon: TrendingUp,
          value: <CountUp to={completedJobs} />,
          label: 'jobs done',
        },
      ]
    : [
        { icon: Users, value: <CountUp to={followers} />, label: 'following' },
        { icon: ShieldCheck, value: 'Escrow', label: 'protected' },
        { icon: BadgeCheck, value: 'Verified', label: 'pros only' },
      ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative isolate overflow-hidden rounded-[28px] border border-slate-800/60 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.7)]"
    >
      <img
        src={discover_hero_image}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover object-right"
      />
      {/* Layered gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/93 to-slate-950/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/50" />
      {/* Ambient blue glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.20),transparent_55%)]" />
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={GRID_PATTERN}
      />
      {/* Fine grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={NOISE_PATTERN}
      />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          {/* Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {isVerified && (
                <div className="absolute -inset-1 rounded-2xl bg-blue-500/35 blur-md" />
              )}
              <Avatar
                src={avatar}
                name={fullName || firstName}
                size={48}
                className="relative ring-2 ring-white/20 shadow-lg shadow-slate-950/40"
              />
              {isVerified && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-blue-600 shadow-lg shadow-blue-500/40">
                  <BadgeCheck size={11} className="text-white" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                  {isProfessional ? 'Professional' : 'Member'}
                </p>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-200 backdrop-blur-sm">
                    <ShieldCheck size={9} />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-slate-400">
                {meta || 'Welcome to SkilledLink'}
              </p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mt-7 text-[30px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[38px] lg:text-[44px]">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-transparent">
              {firstName}
            </span>
            .
          </h1>
          <p className="mt-3.5 max-w-xl text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
            {tagline}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {isProfessional ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/home/jobs')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-[0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-all hover:bg-slate-100 hover:shadow-[0_10px_28px_-8px_rgba(255,255,255,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Briefcase size={15} strokeWidth={2.25} />
                  Find work
                  <ArrowRight
                    size={14}
                    strokeWidth={2.25}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home/portfolio')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.12]"
                >
                  <Layers size={15} strokeWidth={2.25} />
                  Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home/feed')}
                  className="group inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  <Rss size={15} strokeWidth={2.25} />
                  Browse feed
                  <ChevronRight
                    size={14}
                    strokeWidth={2.25}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/home/discover')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-[0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-all hover:bg-slate-100 hover:shadow-[0_10px_28px_-8px_rgba(255,255,255,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Compass size={15} strokeWidth={2.25} />
                  Find a professional
                  <ArrowRight
                    size={14}
                    strokeWidth={2.25}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home/jobs/create')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.12]"
                >
                  <Plus size={15} strokeWidth={2.25} />
                  Post a job
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home/feed')}
                  className="group inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  <Rss size={15} strokeWidth={2.25} />
                  Browse feed
                  <ChevronRight
                    size={14}
                    strokeWidth={2.25}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6">
            {stats.map((s, i) => (
              <StatChip key={i} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * FEED TEASER
 * ═══════════════════════════════════════════════════════════════════ */

function FeedPreviewCard({
  name,
  role,
  time,
  lines,
}: {
  name: string;
  role: string;
  time: string;
  lines: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2.5">
        <Avatar name={name} size={28} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-slate-900 dark:text-slate-100">
            {name}
          </p>
          <p className="truncate text-[10.5px] text-slate-500">{role}</p>
        </div>
        <span className="shrink-0 text-[10px] text-slate-400">{time}</span>
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900"
            style={{ width: `${100 - i * 22}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-0.5 text-[10.5px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Heart size={11} /> 12
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={11} /> 4
        </span>
      </div>
    </div>
  );
}

function FeedTeaser() {
  const navigate = useNavigate();

  return (
    <motion.section {...reveal()}>
      <div className={`${CARD} relative overflow-hidden`}>
        {/* soft glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-500/[0.07] blur-3xl dark:bg-blue-500/[0.10]" />

        <div className="relative grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:p-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              </span>
              Live feed
            </div>

            <h2
              className={`mt-4 text-[22px] font-semibold tracking-tight sm:text-[27px] ${T.primary}`}
            >
              See what the community is building.
            </h2>
            <p
              className={`mt-2.5 max-w-md text-[13.5px] leading-relaxed ${T.secondary}`}
            >
              Fresh work, project updates, and wins from professionals and
              clients across SkilledLink.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/home/feed')}
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] transition-all hover:bg-blue-700 hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Rss size={15} strokeWidth={2.25} />
                Open feed
                <ArrowRight
                  size={14}
                  strokeWidth={2.25}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <button
                type="button"
                onClick={() => navigate('/home/feed/discover')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700"
              >
                <Compass size={15} strokeWidth={2.25} />
                Discover creators
              </button>
            </div>

            <div className="mt-6 flex items-center gap-5 text-[11.5px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles
                  size={12}
                  className="text-blue-600 dark:text-blue-400"
                />
                Trending projects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={12} className="text-blue-600 dark:text-blue-400" />
                Follow creators
              </span>
            </div>
          </div>

          {/* Right — mock feed preview */}
          <div className="relative">
            <div className="relative space-y-2.5">
              <FeedPreviewCard
                name="Amina K."
                role="Product Designer"
                time="2h"
                lines={2}
              />
              <FeedPreviewCard
                name="Jonas M."
                role="Full-stack Developer"
                time="5h"
                lines={2}
              />
              <div className="relative">
                <FeedPreviewCard
                  name="Léa T."
                  role="Brand Photographer"
                  time="1d"
                  lines={1}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 rounded-b-xl bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * HOW IT WORKS
 * ═══════════════════════════════════════════════════════════════════ */

function HowItWorks({ isProfessional }: { isProfessional: boolean }) {
  const steps = isProfessional
    ? [
        {
          icon: FolderOpen,
          title: 'Build your profile',
          desc: 'Add your profession, skills, services, and portfolio. Takes about five minutes.',
        },
        {
          icon: Search,
          title: 'Get matched with clients',
          desc: 'Browse the job board, apply with one click, or let clients reach out directly.',
        },
        {
          icon: Wallet,
          title: 'Deliver and get paid',
          desc: 'Complete the work, get reviewed, and receive payment through escrow — on time.',
        },
      ]
    : [
        {
          icon: Search,
          title: 'Find the right pro',
          desc: 'Browse verified professionals by skill, location, budget, and availability.',
        },
        {
          icon: MessageSquare,
          title: 'Chat, agree, and hire',
          desc: 'Message directly, share briefs, and lock in the project without leaving SkilledLink.',
        },
        {
          icon: Handshake,
          title: 'Approve and release payment',
          desc: 'Funds stay in escrow until you approve the finished work.',
        },
      ];

  return (
    <section>
      <SectionHeader
        eyebrow="How it works"
        title={
          isProfessional
            ? 'From profile to paycheck, in three steps.'
            : 'Hiring great talent, in three steps.'
        }
        description={
          isProfessional
            ? 'SkilledLink is where skilled professionals and serious clients meet, collaborate, and complete work safely.'
            : 'SkilledLink connects you with vetted professionals and protects every transaction from first message to final payment.'
        }
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-800 md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              {...reveal(0.04 + i * 0.06)}
              className="group relative overflow-hidden bg-white p-6 transition-colors hover:bg-slate-50/60 dark:bg-slate-950 dark:hover:bg-slate-900/40 sm:p-7"
            >
              {/* Ghost number */}
              <span className="pointer-events-none absolute -right-1 -top-6 select-none text-[92px] font-bold leading-none tracking-tighter text-slate-100 transition-colors group-hover:text-blue-50 dark:text-slate-900/50 dark:group-hover:text-slate-900">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Top accent line */}
              <span className="absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-x-100" />

              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.6)]">
                  <Icon size={17} strokeWidth={2.25} />
                </span>
                <h3
                  className={`mt-6 text-[15px] font-semibold tracking-tight ${T.primary}`}
                >
                  {step.title}
                </h3>
                <p className={`mt-2 text-[13px] leading-relaxed ${T.secondary}`}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * START HERE
 * ═══════════════════════════════════════════════════════════════════ */

function StartHere({ isProfessional }: { isProfessional: boolean }) {
  const cards = isProfessional
    ? [
        {
          eyebrow: 'Your next chapter',
          title: 'Land more clients',
          desc: 'Browse fresh jobs matched to your skillset and apply in minutes.',
          cta: 'Explore the job board',
          to: '/home/jobs',
          Icon: Briefcase,
        },
        {
          eyebrow: 'Be discovered',
          title: 'Sharpen your portfolio',
          desc: 'Showcase your best work, services, and availability.',
          cta: 'Open portfolio',
          to: '/home/portfolio',
          Icon: Layers,
        },
        {
          eyebrow: 'Build trust',
          title: 'Get verified',
          desc: 'Unlock the blue badge and rank higher in every search.',
          cta: 'Start verification',
          to: '/home/verification',
          Icon: ShieldCheck,
        },
      ]
    : [
        {
          eyebrow: 'Find the perfect match',
          title: 'Discover vetted professionals',
          desc: 'Filter by skill, location, budget, and availability — in one search.',
          cta: 'Start discovering',
          to: '/home/discover',
          Icon: Compass,
        },
        {
          eyebrow: 'Post in two minutes',
          title: 'Have a project in mind?',
          desc: 'Describe the work and get matched with qualified pros instantly.',
          cta: 'Post a job',
          to: '/home/jobs/create',
          Icon: Plus,
        },
        {
          eyebrow: 'Hire with confidence',
          title: 'Escrow-protected',
          desc: 'Funds stay safe until you approve the work. Disputes handled by us.',
          cta: 'How it works',
          to: '/home/verification',
          Icon: ShieldCheck,
        },
      ];

  return (
    <section>
      <SectionHeader
        eyebrow="Start here"
        title={isProfessional ? 'Grow your practice' : 'Find the right help'}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = c.Icon;
          return (
            <motion.div key={c.title} {...reveal(0.04 + i * 0.06)}>
              <Link
                to={c.to}
                className={`group relative flex h-full flex-col overflow-hidden ${CARD} ${CARD_HOVER} p-6`}
              >
                {/* Left accent bar */}
                <span className="absolute left-0 top-7 h-7 w-[2.5px] origin-top scale-y-0 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-y-100 dark:from-blue-400 dark:to-blue-500" />
                {/* Soft glow on hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/0 blur-3xl transition-colors duration-300 group-hover:bg-blue-500/[0.08]" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)] transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon size={19} strokeWidth={2.25} />
                  </div>

                  <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {c.eyebrow}
                  </p>
                  <h3
                    className={`mt-2 text-[16px] font-semibold tracking-tight ${T.primary}`}
                  >
                    {c.title}
                  </h3>
                  <p
                    className={`mt-2 text-[13px] leading-relaxed ${T.secondary}`}
                  >
                    {c.desc}
                  </p>

                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-blue-600 dark:text-blue-400">
                      {c.cta}
                      <ArrowRight
                        size={14}
                        strokeWidth={2.25}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * FEATURED PROFESSIONALS
 * ═══════════════════════════════════════════════════════════════════ */

function ProCard({ pro, index }: { pro: any; index: number }) {
  const u = pro.user ?? {};
  const name =
    `${u.first_name ?? u.firstName ?? ''} ${
      u.last_name ?? u.lastName ?? ''
    }`.trim() || 'Professional';
  const avatar = u.profile_image_url ?? u.profileImageUrl;
  const userId = u.id ?? pro.id;
  const hasDistance =
    typeof pro.distance_km === 'number' && pro.distance_km >= 0;

  return (
    <motion.div {...reveal(0.04 + index * 0.06)} className="h-full">
      <ProfileLink
        userId={userId}
        className={`group flex h-full flex-col ${CARD} ${CARD_HOVER}`}
      >
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <Avatar src={avatar} name={name} size={46} />
              {pro.available && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-slate-950" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3
                  className={`truncate text-[14px] font-semibold ${T.primary}`}
                >
                  {name}
                </h3>
                {pro.is_verified && (
                  <BadgeCheck
                    size={14}
                    className="shrink-0 text-blue-600 dark:text-blue-400"
                  />
                )}
              </div>
              <p className={`mt-0.5 truncate text-[12px] ${T.secondary}`}>
                {pro.profession || 'Professional'}
              </p>

              <div
                className={`mt-2.5 flex items-center gap-3 text-[11.5px] ${T.tertiary}`}
              >
                {pro.rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star size={11} className="fill-current text-amber-500" />
                    <span className={`font-semibold ${T.primary}`}>
                      {Number(pro.rating).toFixed(1)}
                    </span>
                    {pro.total_reviews > 0 && (
                      <span>({pro.total_reviews})</span>
                    )}
                  </span>
                )}
                {hasDistance && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} />
                    {pro.distance_km < 1
                      ? `${Math.round(pro.distance_km * 1000)} m`
                      : `${pro.distance_km.toFixed(1)} km`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3.5 dark:border-slate-900">
          {pro.hourly_rate != null ? (
            <p className="text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
              {pro.currency ?? 'XAF'} {pro.hourly_rate}
              <span className="ml-1 text-[11px] font-normal text-slate-500">
                /hr
              </span>
            </p>
          ) : (
            <p className="text-[12px] italic text-slate-500">
              Rate on request
            </p>
          )}
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400">
            View
            <ArrowUpRight
              size={12}
              strokeWidth={2.25}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </ProfileLink>
    </motion.div>
  );
}

function FeaturedPros({
  professionals,
  loading,
}: {
  professionals: any[] | null | undefined;
  loading: boolean;
}) {
  const list = Array.isArray(professionals) ? professionals.slice(0, 3) : [];

  return (
    <section>
      <SectionHeader
        eyebrow="Handpicked for you"
        title="Meet the community"
        description="Verified professionals with proven track records and strong ratings."
        action={
          <Link
            to="/home/discover"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700"
          >
            View all
            <ChevronRight size={14} strokeWidth={2.25} />
          </Link>
        }
      />

      {loading && list.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[160px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div
          {...reveal(0.04)}
          className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/30"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950">
            <Users size={18} />
          </div>
          <h3 className={`mt-4 text-[15px] font-semibold ${T.primary}`}>
            No professionals to show yet
          </h3>
          <p className={`mt-1.5 max-w-sm text-[13px] ${T.secondary}`}>
            Expand your search radius or try a different specialty on the
            Discover page.
          </p>
          <Link
            to="/home/discover"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] transition-all hover:bg-blue-700"
          >
            <Compass size={14} strokeWidth={2.25} />
            Open Discover
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((pro: any, i: number) => (
            <ProCard key={pro.id ?? i} pro={pro} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * RECENT CONVERSATIONS
 * ═══════════════════════════════════════════════════════════════════ */

function YourConversations({
  conversations,
  loading,
}: {
  conversations: any[] | null | undefined;
  loading: boolean;
}) {
  const list = Array.isArray(conversations) ? conversations.slice(0, 4) : [];

  if (loading && list.length === 0) return null;
  if (list.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Pick up where you left off"
        title="Recent conversations"
        action={
          <Link
            to="/home/messages"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-blue-600 dark:text-blue-400"
          >
            Open inbox
            <ChevronRight size={14} strokeWidth={2.25} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((c: any, i: number) => {
          const p = c.participant ?? {};
          const name =
            p.name ||
            `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() ||
            'Unknown';

          const lm = c.lastMessage;
          const preview =
            lm?.type === 'audio'
              ? 'Voice note'
              : lm?.type === 'image'
              ? 'Photo'
              : lm?.type === 'file'
              ? 'File'
              : lm?.text || lm?.content || 'Started a conversation';
          const unread = c.unreadCount ?? c.unread_count ?? 0;

          return (
            <motion.div key={c.id ?? i} {...reveal(0.03 + i * 0.04)}>
              <Link
                to={`/home/messages/${c.id}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300/70 hover:shadow-[0_2px_6px_rgba(15,23,42,0.04),0_16px_32px_-20px_rgba(37,99,235,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900/70"
              >
                <div className="relative shrink-0">
                  <Avatar src={p.avatar} name={name} size={40} />
                  {p.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-[13px] font-semibold ${T.primary}`}
                    >
                      {name}
                    </p>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold tabular-nums text-white shadow-sm shadow-blue-500/40">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 truncate text-[12px] ${T.tertiary}`}>
                    {preview}
                  </p>
                </div>

                <ChevronRight
                  size={15}
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-700"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * TRUST
 * ═══════════════════════════════════════════════════════════════════ */

function TrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Escrow-protected',
      desc: 'Funds are held safely and only released when the work is approved.',
    },
    {
      icon: BadgeCheck,
      title: 'Verified professionals',
      desc: 'Every pro completes ID verification before taking paid work.',
    },
    {
      icon: MessageSquare,
      title: 'Direct messaging',
      desc: 'Chat, share files, send voice notes, or jump on calls instantly.',
    },
    {
      icon: Users,
      title: 'Hire from anywhere',
      desc: 'Work with top talent across the globe — or someone down the road.',
    },
  ];

  return (
    <motion.section
      {...reveal()}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 px-6 py-14 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.8)] sm:px-10 sm:py-16 lg:px-14 lg:py-20"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
        style={GRID_PATTERN}
      />
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={NOISE_PATTERN}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-400">
            Built on trust
          </p>
          <h2 className="mt-4 text-[24px] font-semibold tracking-tight text-white sm:text-[30px] lg:text-[34px]">
            Safe, transparent, built for real work.
          </h2>
          <p className="mt-3.5 text-[13.5px] leading-relaxed text-slate-400 sm:text-[14.5px]">
            SkilledLink is designed from the ground up to protect both sides of
            every engagement — so you can focus on doing your best work.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                {...reveal(0.04 + i * 0.05)}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-900/70"
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/0 blur-2xl transition-colors duration-300 group-hover:bg-blue-500/[0.15]" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/25">
                    <Icon size={17} strokeWidth={2.25} />
                  </div>
                  <h3 className="mt-4 text-[13.5px] font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * FINAL CTA
 * ═══════════════════════════════════════════════════════════════════ */

function FinalCTA({ isProfessional }: { isProfessional: boolean }) {
  const navigate = useNavigate();

  return (
    <motion.section
      {...reveal()}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:from-blue-950/25 dark:via-slate-950 dark:to-slate-950 sm:p-10 lg:p-12"
    >
      {/* Soft orbs */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        style={GRID_PATTERN_LIGHT}
      />

      <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2
            className={`text-[22px] font-semibold tracking-tight sm:text-[27px] ${T.primary}`}
          >
            {isProfessional
              ? 'Your next client is waiting.'
              : 'Hire your first great professional.'}
          </h2>
          <p className={`mt-2.5 text-[13.5px] leading-relaxed ${T.secondary}`}>
            {isProfessional
              ? 'Keep your profile sharp, reply fast, and let SkilledLink surface the right opportunities for you.'
              : 'Post a job in minutes, review verified pros, and hire with total confidence.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              navigate(
                isProfessional ? '/home/portfolio' : '/home/jobs/create',
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.75)] transition-all hover:bg-blue-700 hover:shadow-[0_14px_32px_-12px_rgba(37,99,235,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isProfessional ? (
              <>
                <Layers size={15} strokeWidth={2.25} />
                Polish my portfolio
              </>
            ) : (
              <>
                <Plus size={15} strokeWidth={2.25} />
                Post a job
              </>
            )}
            <ArrowRight
              size={14}
              strokeWidth={2.25}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
          <button
            type="button"
            onClick={() => navigate('/home/discover')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700"
          >
            <Compass size={15} strokeWidth={2.25} />
            Explore
          </button>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * PAGE
 * ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { currentUser } = useAuth();
  const { user, loading: userLoading } = useUser({ autoFetch: true });
  const { professional } = useProfessional({ autoFetch: true });
  const { conversations, loading: convLoading } = useConversations();

  const nearby = useDiscoverProfessionals({
    location: null,
    radiusKm: 100,
    profession: undefined,
    verifiedOnly: false,
    availableOnly: true,
    limit: 6,
  });

  const activeUser = user ?? currentUser;
  const isProfessional = !!professional;

  if (userLoading && !activeUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={22}
            className="animate-spin text-blue-600 dark:text-blue-400"
          />
          <span className="text-[13px] text-slate-500 dark:text-slate-400">
            Loading your workspace…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-14 sm:space-y-16 lg:space-y-20">
          <Hero
            user={activeUser}
            professional={professional}
            isProfessional={isProfessional}
          />

          <FeedTeaser />

          <HowItWorks isProfessional={isProfessional} />

          <StartHere isProfessional={isProfessional} />

          <FeaturedPros
            professionals={nearby.professionals}
            loading={nearby.loading}
          />

          <YourConversations
            conversations={conversations}
            loading={convLoading}
          />

          <TrustSection />

          <FinalCTA isProfessional={isProfessional} />

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}