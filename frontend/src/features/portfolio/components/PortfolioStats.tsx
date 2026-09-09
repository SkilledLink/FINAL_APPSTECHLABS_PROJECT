// src/features/portfolio/components/PortfolioStats.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Star, Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { Portfolio } from '../../../types/portfolio';

interface PortfolioStatsProps {
  portfolio: Portfolio;
  worksCount: number;
  servicesCount: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function PortfolioStats({
  portfolio,
  worksCount,
  servicesCount,
}: PortfolioStatsProps) {
  const stats = [
    {
      label: 'Completed Works',
      value: worksCount,
      icon: Briefcase,
      color: 'blue',
      badge: 'Projects',
    },
    {
      label: 'Services Offered',
      value: servicesCount,
      icon: Star,
      color: 'amber',
      badge: 'Catalog',
    },
    {
      label: 'Experience',
      value: portfolio.years_experience ? `${portfolio.years_experience} yrs` : 'N/A',
      icon: Clock,
      color: 'emerald',
      badge: 'Tenure',
    },
    {
      label: 'Visibility',
      value: portfolio.is_public ? (
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm font-bold">
          <CheckCircle2 size={16} /> Public
        </span>
      ) : (
        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm font-bold">
          <XCircle size={16} /> Private
        </span>
      ),
      icon: Eye,
      color: 'indigo',
      badge: 'Status',
    },
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'bg-cyan-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      glow: 'bg-amber-500/10',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'bg-emerald-500/10',
    },
    indigo: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20',
      glow: 'bg-indigo-500/10',
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const style = colorStyles[stat.color as keyof typeof colorStyles];

        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 overflow-hidden"
          >
            {/* Background Ambient Glow */}
            <div
              className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${style.glow} group-hover:scale-125`}
            />

            {/* Header: Label & Icon */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div
                className={`p-2.5 rounded-2xl border transition-all duration-300 ${style.bg} ${style.text} ${style.border}`}
              >
                <Icon size={18} />
              </div>
            </div>

            {/* Body: Value */}
            <div className="relative z-10 mt-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {stat.value}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}