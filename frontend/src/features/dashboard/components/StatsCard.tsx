import React from 'react';
import type { DashboardStats } from '../types/dashboard.types';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardList,
  Briefcase,
  Star,
  Clock,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  stats: DashboardStats;
}

interface StatItemProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  change,
  icon,
}) => {
  const isPositive =
    change !== undefined && change >= 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2,
        },
      }}
      className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:p-5"
    >
      {/* Subtle top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-slate-100" />

      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: 3,
          }}
          transition={{
            duration: 0.2,
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
        >
          {icon}
        </motion.div>

        {/* Change */}
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}

            {Math.abs(change)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-5 min-w-0">
        <p className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {value}
        </p>

        <p className="mt-1.5 truncate text-xs font-medium text-slate-500 sm:text-sm">
          {label}
        </p>
      </div>

      {/* Bottom detail */}
      {change !== undefined && (
        <div className="mt-4 flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              isPositive
                ? 'bg-emerald-500'
                : 'bg-red-500'
            }`}
          />

          <span className="truncate text-[11px] text-slate-400 sm:text-xs">
            {isPositive
              ? 'Up from previous period'
              : 'Down from previous period'}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({
  stats,
}) => {
  const items: StatItemProps[] = [
    {
      label: 'Profile Views',
      value: stats.profileViews.toLocaleString(),
      change: stats.profileViewsChange,
      icon: (
        <Users className="h-5 w-5 text-slate-700" />
      ),
    },

    {
      label: 'Service Requests',
      value: stats.serviceRequests,
      change: stats.serviceRequestsChange,
      icon: (
        <ClipboardList className="h-5 w-5 text-slate-700" />
      ),
    },

    {
      label: 'Jobs Completed',
      value: stats.jobsCompleted,
      change: stats.jobsCompletedChange,
      icon: (
        <Briefcase className="h-5 w-5 text-slate-700" />
      ),
    },

    {
      label: 'Average Rating',
      value: stats.averageRating,
      change: stats.averageRatingChange,
      icon: (
        <Star
          className="h-5 w-5 text-slate-700"
          fill="currentColor"
        />
      ),
    },

    {
      label: 'Response Rate',
      value: `${stats.responseRate}%`,
      change: stats.responseRateChange,
      icon: (
        <Clock className="h-5 w-5 text-slate-700" />
      ),
    },

    {
      label: 'Total Earnings',
      value: `CFA ${(stats.totalEarnings * 1000).toLocaleString()}`,
      change: stats.totalEarningsChange,
      icon: (
        <Wallet className="h-5 w-5 text-slate-700" />
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
    >
      {items.map((item) => (
        <StatItem
          key={item.label}
          {...item}
        />
      ))}
    </motion.div>
  );
};
