import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading Hydro Space...' }: LoadingStateProps) {
  return (
    <div className="relative min-h-[450px] w-full flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-cyan-500/20 shadow-2xl overflow-hidden max-w-sm w-full"
      >
        {/* Hydro Ambient Light Refractions */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-cyan-500/20 dark:bg-cyan-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-500/20 dark:bg-blue-500/15 blur-2xl pointer-events-none" />

        {/* Hydro Dual-Ring Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 dark:border-cyan-400/10" />
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-cyan-500 dark:text-cyan-400 animate-pulse" />
        </div>

        {/* Animated Message Text */}
        <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-cyan-200/90 animate-pulse text-center">
          {message}
        </p>
      </motion.div>
    </div>
  );
}