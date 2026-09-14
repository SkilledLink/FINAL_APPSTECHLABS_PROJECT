import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = 'Loading portfolio…',
}: LoadingStateProps) {
  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top Banner Skeleton */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5">
            <div className="h-6 w-56 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-72 rounded-md bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-9 w-32 shrink-0 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-2"
          >
            <div className="h-3 w-16 rounded-sm bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-6 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 animate-pulse">
        <div className="h-8 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-24 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-8 w-24 rounded-md bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Content Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/2 rounded-sm bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/3 rounded-sm bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-sm bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3 w-4/5 rounded-sm bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Spinner & Loading Label */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}