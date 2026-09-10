import type { Job } from '../types/job.types';
import JobCard from './JobCard';

interface JobGridProps {
  jobs: Job[];
  onOpenDetails: (jobId: string) => void;
}

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded mt-4" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      <div className="flex justify-between mt-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-1.5 mt-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-ink-100">
        <div className="skeleton h-8 w-12 rounded-lg" />
        <div className="skeleton h-8 w-12 rounded-lg" />
        <div className="skeleton h-8 w-12 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

export default function JobGrid({ jobs, onOpenDetails }: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-lg text-ink-800">No jobs found</h3>
        <p className="text-sm text-ink-500 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onOpenDetails={onOpenDetails} />
      ))}
    </div>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
