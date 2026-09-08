import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { ShieldCheck, Award, TrendingUp, Zap } from 'lucide-react';

interface CounterProps {
  from?: number;
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const AnimatedNumber: React.FC<CounterProps> = ({
  from = 0,
  to,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 2.2,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(from);

  const rounded = useTransform(count, (latest) =>
    latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );

  const [displayValue, setDisplayValue] = useState(
    from.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(count, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, count, to, duration, rounded]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

const STATS = [
  {
    id: 'pros',
    value: 14500,
    prefix: '',
    suffix: '+',
    decimals: 0,
    label: 'Active Verified Pros',
    subtext: 'License checked & vetted',
    icon: ShieldCheck,
  },
  {
    id: 'success',
    value: 99.4,
    prefix: '',
    suffix: '%',
    decimals: 1,
    label: 'Project Success Rate',
    subtext: 'Backed by escrow protection',
    icon: Award,
  },
  {
    id: 'earnings',
    value: 42,
    prefix: '$',
    suffix: 'M+',
    decimals: 0,
    label: 'Total Pro Earnings',
    subtext: 'Paid directly to contractors',
    icon: TrendingUp,
  },
  {
    id: 'time',
    value: 8,
    prefix: '< ',
    suffix: ' mins',
    decimals: 0,
    label: 'Average Match Time',
    subtext: 'Instant AI trade dispatch',
    icon: Zap,
  },
];

export const StatsSection: React.FC = () => {
  return (
    <section id="stats" className="relative py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-48 bg-blue-600/15 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden backdrop-blur-2xl bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-10 lg:p-12"
      >
        {/* Top Edge Highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-slate-800/80">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`flex flex-col items-center text-center p-3 sm:p-6 group transition-all duration-300 ${
                  idx > 1 ? 'pt-6 sm:pt-6 lg:pt-0' : idx > 0 ? 'pt-0 sm:pt-0' : ''
                }`}
              >
                {/* Icon Container */}
                <div className="mb-3 p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-300">
                  <Icon size={20} />
                </div>

                {/* Animated Number */}
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  <AnimatedNumber
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </h3>

                {/* Label & Description */}
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-[11px] font-normal text-slate-400">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};