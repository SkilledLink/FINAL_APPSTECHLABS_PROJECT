// src/features/auth/components/ProfessionalRequired.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Props {
  accountType: string;
  onUpgrade?: () => void;
  onBack?: () => void;
}

const UNLOCKED_FEATURES = [
  'Showcase your portfolio & before/after gallery',
  'List custom services and pricing models',
  'Manage client bookings and real-time availability',
];

export default function ProfessionalRequired({ accountType, onUpgrade, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto my-12 max-w-xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
    >
      {/* Icon Badge */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 ring-8 ring-amber-500/5 dark:text-amber-400">
        <Briefcase size={36} />
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
          <Sparkles size={12} />
        </span>
      </div>

      {/* Heading & Info */}
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Professional Account Required
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        You are currently signed in with a standard account (
        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {accountType}
        </span>
        ). Upgrade to a professional profile to unlock dedicated creator and business features.
      </p>

      {/* Feature Value Props */}
      <div className="my-6 rounded-2xl bg-slate-50/80 p-4 text-left dark:bg-slate-800/50">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          What you'll unlock
        </p>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {UNLOCKED_FEATURES.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-amber-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        )}
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
          >
            Upgrade Profile <ArrowRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}