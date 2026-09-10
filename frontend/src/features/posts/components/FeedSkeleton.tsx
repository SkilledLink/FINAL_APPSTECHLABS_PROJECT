import React from 'react';

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800/80 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-1/4 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
};

export default FeedSkeleton;