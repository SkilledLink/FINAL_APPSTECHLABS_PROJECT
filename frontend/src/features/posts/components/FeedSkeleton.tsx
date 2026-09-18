// src/features/posts/components/FeedSkeleton.tsx

import React from 'react';

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl shadow-lg shadow-slate-200/30 dark:shadow-black/40 p-4 animate-pulse">
      {/* Glass shine */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-slate-200/70 dark:bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="w-1/4 h-3 bg-slate-200/60 dark:bg-white/8 rounded" />
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2 mb-4">
          <div className="w-3/4 h-5 bg-slate-200/70 dark:bg-white/10 rounded" />
          <div className="w-full h-4 bg-slate-200/60 dark:bg-white/8 rounded" />
          <div className="w-5/6 h-4 bg-slate-200/60 dark:bg-white/8 rounded" />
        </div>

        {/* Media placeholder */}
        <div className="w-full h-64 bg-slate-200/70 dark:bg-white/10 rounded-2xl mb-4" />

        {/* Action row */}
        <div className="flex justify-between items-center pt-3 border-t border-white/40 dark:border-white/10">
          <div className="w-20 h-8 bg-slate-200/70 dark:bg-white/10 rounded-full" />
          <div className="w-24 h-8 bg-slate-200/70 dark:bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default FeedSkeleton;