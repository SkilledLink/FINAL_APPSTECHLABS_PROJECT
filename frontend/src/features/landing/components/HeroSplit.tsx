// src/features/landing/components/HeroSplit.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, MapPin } from "lucide-react";

/* ─────────────────────── embers ─────────────────────── */

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

const EmberField: React.FC<{ count?: number }> = ({ count = 28 }) => {
  const reduce = useReducedMotion();
  const embers = useMemo(() => buildEmbers(count), [count]);
  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
    >
      {embers.map((ember) => (
        <motion.span
          key={ember.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            background:
              "radial-gradient(circle, #FFD27A 0%, #F97316 45%, rgba(249,115,22,0) 75%)",
            boxShadow: "0 0 8px 1px rgba(249,115,22,0.55)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -ember.rise],
            x: [0, ember.drift, ember.drift * 0.4, ember.drift],
            opacity: [0, ember.opacity, ember.opacity * 0.8, 0],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.15, 0.7, 1],
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────── spark flash ─────────────────────── */

const SparkFlash: React.FC = () => {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const loop = () => {
      if (cancelled) return;
      t1 = setTimeout(() => {
        setVisible(true);
        t2 = setTimeout(() => {
          setVisible(false);
          loop();
        }, 220);
      }, 3500 + Math.random() * 4000);
    };
    loop();
    return () => {
      cancelled = true;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[24%] left-1/2 z-[3] rounded-full"
      style={{
        width: 460,
        height: 460,
        background:
          "radial-gradient(circle, rgba(255,210,122,0.65) 0%, rgba(249,115,22,0.35) 30%, rgba(249,115,22,0) 70%)",
        filter: "blur(24px)",
        opacity: visible ? 0.9 : 0,
        transform: `translate(-50%, 0) scale(${visible ? 1.05 : 0.9})`,
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
      }}
    />
  );
};

/* ─────────────────────── hero ─────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;

const HeroSplit: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative">
      <div className="relative flex min-h-[92vh] w-full overflow-hidden bg-[#06142e]">
        {/* Background image */}
        <motion.img
          src="https://thumbs.dreamstime.com/b/african-welder-mask-11110766.jpg"
          alt="A welder at work in Cameroon"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ scale: 1.02 }}
          animate={reduce ? { scale: 1.02 } : { scale: [1.02, 1.08, 1.02] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 34, ease: "easeInOut", repeat: Infinity }
          }
        />

        {/* Dark scrim */}
        <div className="absolute inset-0 z-[1] bg-[#06142e]/72" aria-hidden="true" />

        {/* Ambient effects */}
        <EmberField count={28} />
        <SparkFlash />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col justify-center px-6 pb-24 pt-32 sm:px-10 sm:pb-32 sm:pt-40 lg:px-16">
          {/* Eyebrow */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              Now live in Cameroon
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="max-w-[16ch] text-[clamp(2.5rem,7.5vw,5.75rem)] font-normal leading-[0.98] tracking-[-0.035em] text-white"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            Find someone who actually shows up.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-8 max-w-[52ch] text-[17px] leading-8 text-white/80"
          >
            SkilledLink connects you with electricians, plumbers,
            carpenters, welders and mechanics across Cameroon. Find
            someone near you who knows the work — and get it done.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/home/professionals"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-bold text-[#06142e] shadow-lg shadow-black/20 transition-all hover:bg-blue-50 active:scale-[0.98]"
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
              I'm a professional
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[12.5px] font-medium text-white/65"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-300" />
              <span>Identity-verified pros</span>
            </span>

            <span
              className="hidden h-3 w-px bg-white/15 sm:block"
              aria-hidden="true"
            />

            <span className="flex items-center gap-1.5">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>4.9 average rating</span>
            </span>

            <span
              className="hidden h-3 w-px bg-white/15 sm:block"
              aria-hidden="true"
            />

            <span className="flex items-center gap-2">
              <MapPin size={13} className="text-blue-300" />
              <span>Across 6 major cities</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;