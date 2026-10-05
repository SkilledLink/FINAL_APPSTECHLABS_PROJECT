import React from 'react';
import { Link } from 'react-router-dom';
import SectionLabel from '../../../components/ui/SectionLabel';
import Container from '../../../components/ui/Container';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';
import Stagger from '../../../components/motion/Stagger';

const frustrations = [
  'The tap is leaking.',
  'The lights are off.',
  "The door won't close.",
  "The generator won't start.",
  'The wall needs paint.',
  'The roof needs fixing.',
];

const StatsGrids: React.FC = () => {
  return (
    <section
      id="need-work"
      className="relative overflow-hidden bg-[#f8fafc] py-24 lg:py-40 dark:bg-slate-950"
    >
      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] align-middle dark:bg-[#4F8EFF]" />
              04 / The problem
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:inline dark:text-slate-500">
              Every day, everywhere
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-[0.42fr_0.58fr] lg:gap-24">
          {/* Left — frustration list, THE FIX is Stagger wrapper */}
          <div>
            <Reveal>
              <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                Somewhere, right now
              </p>
            </Reveal>

            <Stagger>
              {frustrations.map((line) => (
                <div
                  key={line}
                  className="reveal border-t border-slate-200 py-5 font-normal italic leading-[1.35] tracking-[-0.015em] text-slate-600 last:border-b text-[clamp(1.05rem,1.6vw,1.35rem)] dark:border-slate-800 dark:text-slate-300"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  {line}
                </div>
              ))}
            </Stagger>
          </div>

          {/* Right — answer */}
          <div className="lg:pt-2">
            <LineReveal
              lines={['The problem is real.', "Finding help shouldn't be."]}
              className="max-w-[18ch] font-normal leading-[1.02] tracking-[-0.035em] text-[#06142e] dark:text-white text-[clamp(2rem,4.5vw,3.5rem)]"
            />

            <Reveal delay={0.2}>
              <p className="mt-10 max-w-[44ch] text-[16px] leading-8 text-slate-600 dark:text-slate-300">
                Something needs fixing. You ask a neighbor. Then a cousin. Then
                a WhatsApp group. By the time you find someone, half the day is
                gone — and you still don&apos;t know if they&apos;ll show up.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-12 border-l-2 border-[#2563EB] pl-6 dark:border-[#4F8EFF]">
                <p
                  className="max-w-[36ch] font-normal italic leading-[1.35] tracking-[-0.02em] text-[#06142e] dark:text-white text-[clamp(1.25rem,2.2vw,1.75rem)]"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  SkilledLink is the answer to the question you keep asking.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <p className="mt-8 max-w-[44ch] text-[15px] leading-7 text-slate-500 dark:text-slate-400">
                Search by trade and by city. Read a professional&apos;s profile
                before you call. See what they&apos;ve built, what they charge,
                and whether they&apos;re free this week.
              </p>
            </Reveal>

            <Reveal delay={0.6}>
              <div className="mt-12">
                <Link
                  to="/home/professionals"
                  className="group inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#2563EB] transition-colors duration-300 hover:text-[#06142e] dark:text-[#4F8EFF] dark:hover:text-white"
                >
                  <span>Find someone near you</span>
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
          </div>
        </div>
      </Container>
    </section>
  );
};

export default StatsGrids;