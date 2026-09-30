// src/features/landing/components/TradesMarquee.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Trade = {
  name: string;
  image: string;
  location: string;
};

const trades: Trade[] = [
  {
    name: "Electrician",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/04/Electrician_at_work.jpg",
    location: "Yaoundé",
  },
  {
    name: "Plumber",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Cameroon_male_plumbier_at_work_01.jpg",
    location: "Douala",
  },
  {
    name: "Carpenter",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/Carpenter_at_work_1.jpg",
    location: "Bafoussam",
  },
  {
    name: "Mason",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Cameroon_male_mason_at_work.jpg",
    location: "Garoua",
  },
  {
    name: "Mechanic",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9a/M%C3%A9canicien_au_travail.jpg",
    location: "Bamenda",
  },
  {
    name: "Welder",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Soudeur2.jpg",
    location: "Buea",
  },
];

const DEFAULT_INDEX = 1;
const ease = [0.16, 1, 0.3, 1] as const;

const TradesMarquee: React.FC = () => {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_INDEX);

  const activeTrade = trades[activeIndex];
  const total = trades.length;
  const indexLabel = `${String(activeIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <section
      id="trades"
      className="relative bg-[#f8fafc] pb-28 pt-12 lg:pb-12 lg:pt-16"
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500"
        >
        </motion.div>

        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.15, ease }}
          style={{ transformOrigin: "left" }}
          className="mt-5 h-px w-full bg-slate-200"
        />

        <div className="mt-14 grid gap-16 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
          <div>
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.2, ease }}
              className="max-w-[18ch] text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              The people who build, wire, and fix.
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="mt-8 max-w-[46ch] text-[17px] leading-8 text-slate-600"
            >
              SkilledLink covers the trades that keep homes,
              workshops, and businesses running. Search by trade
              and city. Every professional has a profile you can
              read before you call.
            </motion.p>

            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-14"
            >
              {trades.map((trade, i) => {
                const isActive = activeIndex === i;
                return (
                  <li
                    key={trade.name}
                    className="border-t border-slate-200 last:border-b"
                  >
                    <Link
                      to="/home/professionals"
                      onMouseEnter={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      className="group flex items-baseline justify-between gap-6 py-6 sm:py-7"
                    >
                      <span className="flex items-baseline gap-6 sm:gap-10">
                        <span
                          className={`text-[11px] font-medium tabular-nums transition-colors duration-300 ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span className="relative">
                          <span
                            className={`block text-[clamp(1.5rem,3.5vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.03em] transition-colors duration-300 ${
                              isActive ? "text-blue-600" : "text-[#06142e]"
                            }`}
                            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                          >
                            {trade.name}
                          </span>

                          <span
                            aria-hidden="true"
                            className={`absolute -bottom-1 left-0 h-[2px] bg-blue-600 transition-all duration-500 ${
                              isActive ? "w-full" : "w-0"
                            }`}
                          />
                        </span>
                      </span>

                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
                        {trade.location}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </motion.ul>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-12"
            >
              <Link
                to="/home/professionals"
                className="text-[15px] text-blue-600 underline decoration-blue-600/30 decoration-1 underline-offset-[7px] transition-colors duration-200 hover:decoration-blue-600"
              >
                Browse all professionals
              </Link>
            </motion.div>
          </div>

          <div className="relative hidden lg:block">
            <div className="mb-4 flex items-baseline justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
              <span>Featured trade</span>
              <span className="tabular-nums">{indexLabel}</span>
            </div>

            <div className="mb-4 h-px w-full bg-slate-200" />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="relative ml-auto w-full max-w-[440px]"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              <span
                aria-hidden="true"
                className="absolute -left-4 -top-3 z-20 h-5 w-16 bg-blue-600"
                style={{
                  transform: "rotate(-6deg)",
                  boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
                }}
              />

              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 30%, rgba(6,20,46,0.05), transparent 60%), radial-gradient(circle at 80% 70%, rgba(6,20,46,0.04), transparent 55%)",
                  }}
                />

                <AnimatePresence mode="sync">
                  <motion.div
                    key={activeTrade.name}
                    initial={
                      reduce
                        ? { opacity: 1 }
                        : { opacity: 0, clipPath: "inset(0 100% 0 0)", scale: 1.04 }
                    }
                    animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)", scale: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 1.02, transition: { duration: 0.55, ease } }
                    }
                    transition={{
                      clipPath: { duration: 0.7, ease },
                      opacity: { duration: 0.5, ease },
                      scale: { duration: 0.9, ease },
                    }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeTrade.image}
                      alt={`${activeTrade.name} at work in ${activeTrade.location}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-center"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#06142e]/75 to-transparent"
                    />

                    <div className="absolute inset-x-5 bottom-5 flex items-baseline justify-between gap-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white/85">
                      <span>{activeTrade.name}</span>
                      <span>{activeTrade.location}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-3 z-10 h-3 w-3 border-l border-t border-white/40"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3 z-10 h-3 w-3 border-r border-t border-white/40"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 left-3 z-10 h-3 w-3 border-b border-l border-white/40"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 right-3 z-10 h-3 w-3 border-b border-r border-white/40"
                />
              </div>
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-6 text-right text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400"
            >
              One of many, across the country
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradesMarquee;