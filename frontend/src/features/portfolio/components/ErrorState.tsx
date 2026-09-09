import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative max-w-lg mx-auto my-16 p-8 text-center overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-red-500/20 dark:border-red-500/20 shadow-[0_20px_50px_rgba(239,68,68,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
    >
      {/* Hydro Ambient Light Refractions */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-red-500/10 dark:bg-red-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Hydro Error Badge */}
        <div className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-red-500/15 via-rose-500/10 to-red-600/15 dark:from-red-500/20 dark:to-rose-900/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Unable to Load Portfolio
        </h3>

        <p className="text-sm font-medium text-red-600 dark:text-red-400/90 mt-2 max-w-md leading-relaxed px-2">
          {error}
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-95"
        >
          <RefreshCw size={16} />
          <span>Reload Dashboard</span>
        </button>
      </div>
    </motion.div>
  );
}