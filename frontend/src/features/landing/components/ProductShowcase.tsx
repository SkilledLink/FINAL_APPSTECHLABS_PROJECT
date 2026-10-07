// src/features/landing/components/ProductShowcase.tsx
import React, { useRef } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  Search,
  Users,
  UserCircle2,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../../components/ui/Container';
import SectionLabel from '../../../components/ui/SectionLabel';
import LineReveal from '../../../components/motion/LineReveal';
import Reveal from '../../../components/motion/Reveal';

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { icon: Search,         label: 'Search',     note: 'Describe the job' },
  { icon: Users,          label: 'Professionals', note: 'Compare profiles' },
  { icon: UserCircle2,    label: 'Profile',    note: 'Read the detail' },
  { icon: MessageSquare,  label: 'Conversation', note: 'Talk it through' },
  { icon: CheckCircle2,   label: 'Request',    note: 'Confirm the job' },
];

const ProductShowcase: React.FC = () => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const progress = useTransform(scrollYProgress, [0.15, 0.75], [0, 1]);

  return (
    <section
      id="showcase"
      className="relative overflow-hidden bg-[#06142e] py-24 text-white lg:py-32 dark:bg-black"
    >
      {/* Subtle atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 0%, rgba(37,99,235,0.18), transparent 60%), radial-gradient(ellipse 55% 45% at 90% 100%, rgba(79,142,255,0.14), transparent 65%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 85%)',
        }}
      />

      <Container width="wide">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel className="!text-slate-400">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4F8EFF] align-middle" />
              07 / One experience
            </SectionLabel>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 sm:inline">
              End to end
            </span>
          </div>
        </Reveal>

        <div className="mt-5 h-px w-full bg-white/10" />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
          <LineReveal
            lines={['Everything connects.', 'Nothing gets lost.']}
            className="max-w-[18ch] font-normal leading-[1.02] tracking-[-0.035em] text-white text-[clamp(2rem,4.4vw,3.5rem)]"
          />
          <Reveal delay={0.2}>
            <p className="max-w-[46ch] text-[16px] leading-8 text-slate-300">
              From the first search to the confirmed request, every step lives
              in one place. Nothing falls between a WhatsApp thread and a
              missed call.
            </p>
          </Reveal>
        </div>

        {/* Flow */}
        <div ref={ref} className="mt-20 lg:mt-28">
          {/* Desktop: horizontal */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connector track */}
              <div className="absolute left-[6%] right-[6%] top-[44px] h-px bg-white/12" />
              <motion.div
                className="absolute left-[6%] top-[44px] h-px origin-left bg-[#4F8EFF]"
                style={{
                  width: '88%',
                  scaleX: reduce ? 1 : progress,
                }}
              />

              {/* Travelling dot */}
              {!reduce && (
                <motion.span
                  className="pointer-events-none absolute top-[44px] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4F8EFF] shadow-[0_0_20px_rgba(79,142,255,0.9)]"
                  style={{ left: useTransform(progress, [0, 1], ['6%', '94%']) }}
                  animate={{ opacity: inView ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Nodes */}
              <ol className="relative grid grid-cols-5 gap-4">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const threshold = i / (STEPS.length - 1);
                  return (
                    <motion.li
                      key={step.label}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease }}
                      className="flex flex-col items-center text-center"
                    >
                      <span className="relative flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                        <NodeDot threshold={threshold} progress={progress} reduce={!!reduce} />
                      </span>
                      <span className="mt-5 text-[13px] font-bold tracking-tight text-white">
                        {step.label}
                      </span>
                      <span className="mt-1 text-[11.5px] leading-5 text-slate-400">
                        {step.note}
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Mobile: vertical */}
          <ol className="relative lg:hidden">
            <div
              aria-hidden
              className="absolute bottom-6 left-[34px] top-6 w-px bg-white/12"
            />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.label}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease }}
                  className="relative flex items-start gap-4 py-4"
                >
                  <span className="relative z-10 flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-[#06142e]">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                  </span>
                  <div className="pt-2">
                    <p className="text-[14px] font-bold tracking-tight text-white">
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-5 text-slate-400">
                      {step.note}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <Reveal delay={0.3}>
          <p className="mt-16 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
            SkilledLink · From search to service
          </p>
        </Reveal>
      </Container>
    </section>
  );
};

function NodeDot({
  threshold,
  progress,
  reduce,
}: {
  threshold: number;
  progress: ReturnType<typeof useTransform<number, number>>;
  reduce: boolean;
}) {
  const opacity = useTransform(progress, [threshold - 0.06, threshold], [0, 1]);
  const scale = useTransform(progress, [threshold - 0.06, threshold], [0.4, 1]);
  return (
    <motion.span
      aria-hidden
      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#4F8EFF] shadow-[0_0_0_3px_rgba(6,20,46,0.9)]"
      style={{ opacity: reduce ? 1 : opacity, scale: reduce ? 1 : scale }}
    />
  );
}

export default ProductShowcase;