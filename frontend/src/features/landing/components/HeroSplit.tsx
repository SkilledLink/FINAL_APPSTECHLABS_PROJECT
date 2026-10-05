import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Star, MapPin } from 'lucide-react';
import LineReveal from '../../../components/motion/LineReveal';

/* ── embers ── */

type Ember = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  rise: number;
};

const buildEmbers = (count: number): Ember[] => {
  const embers: Ember[] = [];
  for (let i = 0; i < count; i += 1) {
    embers.push({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 9 + Math.random() * 8,
      delay: Math.random() * 10,
      drift: -60 + Math.random() * 120,
      opacity: 0.35 + Math.random() * 0.45,
      rise: 220 + Math.random() * 180,
    });
  }
  return embers;
};

const EmberField: React.FC<{ count?: number }> = ({ count = 22 }) => {
  const [reduced, setReduced] = useState(false);
  const embers = useMemo(() => buildEmbers(count), [count]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
    >
      {embers.map((ember) => (
        <span
          key={ember.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            background:
              'radial-gradient(circle, #FFD27A 0%, #F97316 45%, rgba(249,115,22,0) 75%)',
            boxShadow: '0 0 8px 1px rgba(249,115,22,0.55)',
            animation: `emberRise ${ember.duration}s ease-out ${ember.delay}s infinite`,
            ['--ember-drift' as never]: `${ember.drift}px`,
            ['--ember-rise' as never]: `${ember.rise}px`,
            ['--ember-opacity' as never]: ember.opacity,
          }}
        />
      ))}
      <style>{`
        @keyframes emberRise {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          15%  { opacity: var(--ember-opacity); }
          70%  { opacity: calc(var(--ember-opacity) * 0.8); }
          100% { transform: translate3d(var(--ember-drift), calc(var(--ember-rise) * -1), 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/* ── hero ── */

const HeroSplit: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="home" className="relative">
      <div className="relative flex min-h-[92vh] w-full overflow-hidden bg-[#06142e]">
        {/* Background image with slow drift */}
        <div className="hero-media absolute inset-0">
          <img
            src="https://thumbs.dreamstime.com/b/african-welder-mask-11110766.jpg"
            alt="A welder at work in Cameroon"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>

        {/* Scrim */}
        <div className="absolute inset-0 z-[1] bg-[#06142e]/72" aria-hidden="true" />

        {/* Ambient */}
        <EmberField count={22} />

        {/* Content */}
        <div
          className={`hero-stagger relative z-10 mx-auto flex w-full max-w-[1280px] flex-col justify-center px-6 pb-24 pt-32 sm:px-10 sm:pb-32 sm:pt-40 lg:px-16 ${ready ? 'is-ready' : ''}`}
        >
          {/* Eyebrow */}
          <div className="mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EFF] shadow-[0_0_10px_rgba(79,142,255,0.9)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              Now live in Cameroon
            </span>
          </div>

          {/* Headline — line reveal */}
          <LineReveal
            trigger="mount"
            delay={0.5}
            lines={['Find someone who', 'actually shows up.']}
            className="max-w-[16ch] font-normal leading-[0.98] tracking-[-0.035em] text-white text-[clamp(2.5rem,7.5vw,5.75rem)]"
          />

          {/* Subtext */}
          <p className="mt-8 max-w-[52ch] text-[17px] leading-8 text-white/80">
            SkilledLink connects you with electricians, plumbers, carpenters,
            welders and mechanics across Cameroon. Find someone near you who
            knows the work — and get it done.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              to="/home/professionals"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-bold text-[#06142e] shadow-lg shadow-black/20 transition-all hover:bg-[#eef3ff] active:scale-[0.98]"
            >
              Find a pro near you
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-6 py-3.5 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/[0.12] active:scale-[0.98]"
            >
              I&apos;m a professional
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[12.5px] font-medium text-white/65">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#4F8EFF]" />
              <span>Identity-verified pros</span>
            </span>

            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />

            <span className="flex items-center gap-1.5">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>4.9 average rating</span>
            </span>

            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />

            <span className="flex items-center gap-2">
              <MapPin size={13} className="text-[#4F8EFF]" />
              <span>Across 6 major cities</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;