// src/features/landing/components/Hero.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

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

const ease = [0.16, 1, 0.3, 1] as const;

const Hero: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative">
      <div className="relative min-h-[92vh] w-full overflow-hidden bg-[#06142e]">
        <motion.img
          src="https://thumbs.dreamstime.com/b/african-welder-mask-11110766.jpg"
          alt="A welder at work in Cameroon"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ scale: 1.02 }}
          animate={reduce ? { scale: 1.02 } : { scale: [1.02, 1.08, 1.02] }}
          transition={
            reduce ? { duration: 0 } : { duration: 34, ease: "easeInOut", repeat: Infinity }
          }
        />

        <div className="absolute inset-0 z-[1] bg-[#06142e]/70" aria-hidden="true" />

        <div
          className="absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-[#06142e]/85 to-transparent"
          aria-hidden="true"
        />

        <EmberField count={28} />
        <SparkFlash />

        {/* FADE TO PAGE */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 sm:h-52"
          style={{
            background:
              "linear-gradient(to bottom, rgba(248,250,252,0) 0%, rgba(248,250,252,0.35) 45%, rgba(248,250,252,0.85) 78%, #f8fafc 100%)",
          }}
        />

        {/* Dark mode override — same fade but into slate-950 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] hidden h-40 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950 sm:h-52 dark:block"
        />

        <div className="relative z-10 flex min-h-[92vh] flex-col">
          <div className="mx-auto w-full max-w-[1280px] px-6 pt-10 sm:px-10 lg:px-16">
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-white/70"
            >
              <div className="flex items-baseline gap-0 text-sm font-bold tracking-tight normal-case">
                <span className="text-white">Skilled</span>
                <span className="text-blue-500">Link</span>
              </div>

              <span className="flex items-center gap-2.5">
                <span className="h-[6px] w-[6px] bg-blue-500" aria-hidden="true" />
                <span>Cameroon</span>
              </span>
            </motion.div>

            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, delay: 0.35, ease }}
              style={{ transformOrigin: "left" }}
              className="mt-5 h-px w-full bg-white/15"
            />
          </div>

          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:px-16">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease }}
              className="max-w-[16ch] text-[clamp(2.5rem,7.5vw,5.75rem)] font-normal leading-[0.98] tracking-[-0.035em] text-white"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Find someone who actually shows up.
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="mt-10 max-w-[46ch] text-[17px] leading-8 text-white/80"
            >
              SkilledLink connects you with electricians, plumbers,
              carpenters, welders and mechanics across Cameroon. Find
              someone near you who knows the work, and get it done.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease }}
              className="mt-12 flex flex-wrap items-baseline gap-x-12 gap-y-4 text-[15px]"
            >
              <Link
                to="/home/professionals"
                className="text-white underline decoration-white/40 decoration-1 underline-offset-[7px] transition-colors duration-200 hover:decoration-white"
              >
                Find a professional
              </Link>

              <Link
                to="#how"
                className="text-white/65 underline decoration-white/25 decoration-1 underline-offset-[7px] transition-colors duration-200 hover:text-white hover:decoration-white/60"
              >
                How it works
              </Link>
            </motion.div>
          </div>

          <div className="mx-auto w-full max-w-[1280px] px-6 pb-40 sm:px-10 sm:pb-52 lg:px-16">
            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, delay: 1.4, ease }}
              style={{ transformOrigin: "left" }}
              className="h-px w-full bg-white/20"
            />

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.75 }}
              className="flex items-baseline justify-between gap-6 pt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60"
            >
              <span>Welder, at work</span>
              <span className="hidden sm:inline">Cameroon</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;