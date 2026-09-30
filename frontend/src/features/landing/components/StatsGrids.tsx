// src/features/landing/components/StatsGrids.tsx

import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const frustrations = [
  "The tap is leaking.",
  "The lights are off.",
  "The door won't close.",
  "The generator won't start.",
  "The wall needs paint.",
  "The roof needs fixing.",
];

const ease = [0.16, 1, 0.3, 1] as const;

const StatsGrids: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section
      id="need-work"
      className="relative overflow-hidden bg-[#f8fafc] py-28 lg:py-40"
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500"
        >
          <span>04 / The problem</span>
          <span>Every day, everywhere</span>
        </motion.div>

        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.15, ease }}
          style={{ transformOrigin: "left" }}
          className="mt-5 h-px w-full bg-slate-200"
        />

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-[0.42fr_0.58fr] lg:gap-24">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-8 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400"
            >
              Somewhere, right now
            </motion.p>

            <ul>
              {frustrations.map((line, i) => (
                <motion.li
                  key={line}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease }}
                  className="border-t border-slate-200 py-5 text-[clamp(1.05rem,1.6vw,1.35rem)] font-normal italic leading-[1.35] tracking-[-0.015em] text-slate-600 last:border-b"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {line}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-2">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="max-w-[18ch] text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              The problem is real. Finding help shouldn&apos;t be.
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.45, ease }}
              className="mt-10 max-w-[44ch] text-[17px] leading-8 text-slate-600"
            >
              Something needs fixing. You ask a neighbor. Then a
              cousin. Then a WhatsApp group. By the time you find
              someone, half the day is gone — and you still don&apos;t
              know if they&apos;ll show up.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-12 border-l-2 border-blue-600 pl-6"
            >
              <p
                className="max-w-[36ch] text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal italic leading-[1.35] tracking-[-0.02em] text-[#06142e]"
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              >
                SkilledLink is the answer to the question you keep
                asking.
              </p>
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="mt-8 max-w-[44ch] text-[15px] leading-7 text-slate-500"
            >
              Search by trade and by city. Read a professional&apos;s
              profile before you call. See what they&apos;ve built,
              what they charge, and whether they&apos;re free this
              week.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 1.05 }}
              className="mt-12"
            >
              <Link
                to="/home/professionals"
                className="text-[15px] text-blue-600 underline decoration-blue-600/30 decoration-1 underline-offset-[7px] transition-colors duration-200 hover:decoration-blue-600"
              >
                Find someone near you
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsGrids;