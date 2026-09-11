import { SearchX } from 'lucide-react';
import type { Job } from '../types/job.types';
import JobCard from './JobCard';

interface JobGridProps {
  jobs: Job[];
  onOpenDetails: (jobId: string) => void;
  onPatch?: (jobId: string, patch: Partial<Job>) => void;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Media Skeleton */}
      <div className="aspect-[16/9] w-full animate-pulse bg-slate-200 dark:bg-slate-800" />

      {/* Body Skeleton */}
      <div className="p-5 space-y-4">
        {/* Author header skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-20 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Title skeleton */}
        <div className="h-5 w-3/4 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />

        {/* Description lines skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-4/5 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Footer controls skeleton */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-8 w-14 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-14 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-14 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobGrid({ jobs, onOpenDetails, onPatch }: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-sm">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
          No jobs found
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          We couldn't find any listings matching your current criteria. Try adjusting your search query or clear active filters.
        </p>
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