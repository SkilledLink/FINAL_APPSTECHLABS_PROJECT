import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CalendarCheck, Sparkles } from 'lucide-react';
import type { Availability } from '../../../types/portfolio';
import AvailabilityEditor from './AvailabilityEditor';

interface AvailabilitySectionProps {
  availability: Availability[];
  onSave: (data: any[]) => Promise<void>;
}

export default function PortfolioAvailability({ availability, onSave }: AvailabilitySectionProps) {
  // Calculate active schedule slots for the status badge
  const activeDaysCount = availability
    ? availability.filter((a: any) => a.is_available ?? a.available ?? a.active).length
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Hydro Glassmorphism Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/80 dark:border-cyan-500/15 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-sky-500/15 to-blue-600/15 dark:from-cyan-400/20 dark:to-blue-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 shadow-inner shrink-0">
            <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Working Schedule & Availability
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                <Sparkles size={12} />
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure your weekly availability slots, business hours, and instant booking status.
            </p>
          </div>
        </div>

        {/* Counter & Status Indicator */}
        {availability && availability.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-cyan-900/30 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-inner">
            <CalendarCheck size={15} className="text-cyan-500" />
            <span>
              <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">{activeDaysCount}</strong> / {availability.length} Days Active
            </span>
          </div>
        )}
      </div>

      {/* Editor Main Hydro Glass Card Container */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-cyan-500/20 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,150,255,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
        {/* Ambient Hydro Light Reflections */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <AvailabilityEditor availability={availability} onSave={onSave} />
        </div>
      </div>
    </motion.section>
  );
}