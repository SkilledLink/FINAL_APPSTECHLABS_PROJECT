import { RefreshCw, SearchX } from 'lucide-react';
import type { Job } from '../types/job.types';
import JobCard from './JobCard';

interface JobGridProps {
  jobs: Job[];
  onOpenDetails: (jobId: string) => void;
  onPatch?: (jobId: string, patch: Partial<Job>) => void;
  onResetFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Media Skeleton */}
      <div className="aspect-[16/9] w-full animate-pulse bg-slate-100 dark:bg-slate-800/80" />

      {/* Body Skeleton */}
      <div className="p-4 space-y-4">
        {/* Author Header Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-md animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded-sm animate-pulse bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-20 rounded-sm animate-pulse bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-7 w-7 rounded-md animate-pulse bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Title Skeleton */}
        <div className="h-4 w-5/6 rounded-sm animate-pulse bg-slate-200 dark:bg-slate-800" />

        {/* Description Lines Skeleton */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full rounded-sm animate-pulse bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-3 w-3/4 rounded-sm animate-pulse bg-slate-100 dark:bg-slate-800/60" />
        </div>

        {/* Footer Controls Skeleton */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="h-7 w-12 rounded-md animate-pulse bg-slate-100 dark:bg-slate-800" />
            <div className="h-7 w-12 rounded-md animate-pulse bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-7 w-14 rounded-md animate-pulse bg-slate-100 dark:bg-slate-800" />
            <div className="h-7 w-12 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobGrid({
  jobs,
  onOpenDetails,
  onPatch,
  onResetFilters,
}: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 shadow-xs">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
          No matching listings found
        </h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          We couldn't find any jobs matching your current search parameters or active filters.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onOpenDetails={onOpenDetails}
          onPatch={onPatch}
        />
      ))}
    </div>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}