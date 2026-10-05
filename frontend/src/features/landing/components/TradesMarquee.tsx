import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionLabel from '../../../components/ui/SectionLabel';
import Container from '../../../components/ui/Container';
import LineReveal from '../../../components/motion/LineReveal';
import ImageReveal from '../../../components/motion/ImageReveal';
import Reveal from '../../../components/motion/Reveal';
import Stagger from '../../../components/motion/Stagger';

type Trade = { name: string; image: string; location: string };

const trades: Trade[] = [
  { name: 'Electrician', image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Electrician_at_work.jpg', location: 'Yaoundé' },
  { name: 'Plumber',     image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Cameroon_male_plumbier_at_work_01.jpg', location: 'Douala' },
  { name: 'Carpenter',   image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Carpenter_at_work_1.jpg', location: 'Bafoussam' },
  { name: 'Mason',       image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Cameroon_male_mason_at_work.jpg', location: 'Garoua' },
  { name: 'Mechanic',    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/M%C3%A9canicien_au_travail.jpg', location: 'Bamenda' },
  { name: 'Welder',      image: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Soudeur2.jpg', location: 'Buea' },
];

const DEFAULT_INDEX = 1;

const TradesMarquee: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
  const activeTrade = trades[activeIndex];
  const total = trades.length;
  const indexLabel = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <section
      id="trades"
      className="relative bg-[#f8fafc] py-20 lg:py-32 dark:bg-slate-950"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              02 / What we cover
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline dark:text-slate-500">
              Trades · Cities
            </span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
          {/* Left — headline + list */}
          <div>
            <LineReveal
              lines={['The people who', 'build, wire, and fix.']}
              className="max-w-[18ch] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.5vw,3.5rem)]"
              delay={0.1}
            />

            <Reveal delay={0.25}>
              <p className="mt-8 max-w-[46ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
                SkilledLink covers the trades that keep homes, workshops, and
                businesses running. Search by trade and city. Every
                professional has a profile you can read before you call.
              </p>
            </Reveal>

            {/* THE FIX: list is inside Stagger */}
            <Stagger className="mt-14">
              {trades.map((trade, i) => {
                const isActive = activeIndex === i;
                return (
                  <Link
                    key={trade.name}
                    to="/home/professionals"
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    className="reveal group flex items-baseline justify-between gap-6 border-t border-slate-200 py-6 transition-colors duration-300 last:border-b hover:border-[#2563EB]/40 sm:py-7 dark:border-slate-800 dark:hover:border-[#4F8EFF]/40"
                  >
                    <span className="flex items-baseline gap-6 sm:gap-10">
                      <span
                        className={`text-[11px] font-medium tabular-nums transition-colors duration-300 ${
                          isActive
                            ? 'text-[#2563EB] dark:text-[#4F8EFF]'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="relative">
                        <span
                          className={`block font-normal leading-[1.05] tracking-[-0.03em] transition-colors duration-300 text-[clamp(1.5rem,3.5vw,2.75rem)] ${
                            isActive
                              ? 'text-[#2563EB] dark:text-[#4F8EFF]'
                              : 'text-[#06142e] dark:text-white'
                          }`}
                          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                        >
                          {trade.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-1 left-0 h-[2px] bg-[#2563EB] transition-all duration-500 dark:bg-[#4F8EFF] ${
                            isActive ? 'w-full' : 'w-0'
                          }`}
                        />
                      </span>
                    </span>

                    <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:block sm:text-[11px] dark:text-slate-400">
                      {trade.location}
                    </span>
                  </Link>
                );
              })}
            </Stagger>

            <Reveal delay={0.6} className="mt-12">
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
            </Reveal>
          </div>

          {/* Right — featured image */}
          <div className="relative hidden lg:block">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <span>Featured trade</span>
                <span className="tabular-nums">{indexLabel}</span>
              </div>
              <div className="mb-4 h-px w-full bg-slate-200 dark:bg-slate-800" />
            </Reveal>

            <Reveal delay={0.15}>
              <div
                className="group relative ml-auto w-full max-w-[440px]"
                style={{ transform: 'rotate(-1.5deg)' }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-4 -top-3 z-20 h-5 w-16 bg-[#2563EB] dark:bg-[#4F8EFF]"
                  style={{
                    transform: 'rotate(-6deg)',
                    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08)',
                  }}
                />

                <ImageReveal pattern="horizontal" className="aspect-[4/5] w-full">
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      key={activeTrade.name}
                      src={activeTrade.image}
                      alt={`${activeTrade.name} at work in ${activeTrade.location}`}
                      className="h-full w-full scale-[1.02] object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.06]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                      loading="lazy"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#06142e]/80 via-[#06142e]/30 to-transparent"
                    />
                    <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-baseline justify-between gap-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">
                      <span>{activeTrade.name}</span>
                      <span>{activeTrade.location}</span>
                    </div>
                  </div>
                </ImageReveal>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="mt-6 text-right text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                One of many, across the country
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TradesMarquee;