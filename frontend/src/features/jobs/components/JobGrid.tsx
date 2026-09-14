// src/features/jobs/components/JobGrid.tsx
import { RefreshCw, SearchX } from 'lucide-react';
import type { Job } from '../types/job.types';
import JobCard from './JobCard';

interface JobGridProps {
  jobs: Job[];
  onOpenDetails: (jobId: string) => void;
  onPatch?: (jobId: string, patch: Partial<Job>) => void;
  onResetFilters?: () => void;
}

/* ───────────────────────── Skeleton tokens ───────────────────────── */

const SKEL_BLOCK = 'animate-pulse bg-blue-500/8 dark:bg-white/5';
const SKEL_SOFT = 'animate-pulse bg-blue-500/5 dark:bg-white/[0.03]';
const SKEL_STRONG = 'animate-pulse bg-blue-500/12 dark:bg-white/[0.07]';

/* ───────────────────────── Skeleton card ───────────────────────── */

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-md border border-slate-200/70 bg-white/85 backdrop-blur-xl
                 dark:border-white/10 dark:bg-slate-900/60
                 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]
                 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)]"
    >
      {/* Media skeleton */}
      <div className={`aspect-[16/9] w-full ${SKEL_BLOCK}`} />

      {/* Body skeleton */}
      <div className="space-y-4 p-4 sm:p-5">
        {/* Author row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`h-9 w-9 shrink-0 rounded-full ${SKEL_STRONG}`} />
            <div className="min-w-0 space-y-1.5">
              <div className={`h-3 w-28 rounded-sm ${SKEL_BLOCK}`} />
              <div className={`h-2.5 w-20 rounded-sm ${SKEL_SOFT}`} />
            </div>
          </div>
          <div className={`h-7 w-7 shrink-0 rounded ${SKEL_SOFT}`} />
        </div>

        {/* Title */}
        <div className={`h-4 w-5/6 rounded-sm ${SKEL_STRONG}`} />

        {/* Description lines */}
        <div className="space-y-1.5 pt-0.5">
          <div className={`h-3 w-full rounded-sm ${SKEL_BLOCK}`} />
          <div className={`h-3 w-3/4 rounded-sm ${SKEL_SOFT}`} />
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-white/10">
          <div className="flex gap-1.5">
            <div className={`h-7 w-12 rounded ${SKEL_BLOCK}`} />
            <div className={`h-7 w-12 rounded ${SKEL_BLOCK}`} />
          </div>
          <div className="flex gap-1.5">
            <div className={`h-7 w-14 rounded ${SKEL_SOFT}`} />
            <div className={`h-7 w-12 rounded ${SKEL_STRONG}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Grid ───────────────────────── */

export default function JobGrid({
  jobs,
  onOpenDetails,
  onPatch,
  onResetFilters,
}: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-md border border-dashed border-blue-500/25
                   bg-blue-500/[0.03] px-6 py-12 text-center backdrop-blur-sm
                   dark:border-blue-400/20 dark:bg-blue-500/[0.04]"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <div
            className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-md
                       border border-blue-500/20 bg-blue-500/10 text-blue-600
                       shadow-sm shadow-blue-500/10
                       dark:border-blue-400/20 dark:text-blue-400"
          >
            <SearchX className="h-5 w-5" />
          </div>

          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            No matching listings found
          </h3>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            We couldn't find any jobs matching your current search parameters
            or active filters.
          </p>

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="group mt-5 inline-flex items-center gap-2 rounded bg-blue-600
                         px-4 py-2 text-xs font-semibold text-white
                         shadow-md shadow-blue-500/25 transition-all
                         hover:-translate-y-0.5 hover:bg-blue-500
                         hover:shadow-lg hover:shadow-blue-500/30
                         active:scale-[0.98]"
            >
              <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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

/* ───────────────────────── Skeleton export ───────────────────────── */

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}