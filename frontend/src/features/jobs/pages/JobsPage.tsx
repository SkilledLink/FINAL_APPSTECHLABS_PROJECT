import { ArrowUpRight, Briefcase, ImageIcon, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../../auth/hooks/useAuth';
import JobSearch from '../components/JobSearch';
import JobFilters, { type JobFiltersState } from '../components/JobFilters';
import JobGrid, { JobGridSkeleton } from '../components/JobGrid';

interface JobsPageProps {
  onOpenDetails?: (jobId: string) => void;
  onCreateJob?: () => void;
}

export default function JobsPage({ onOpenDetails, onCreateJob }: JobsPageProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleOpenDetails =
    onOpenDetails ?? ((jobId: string) => navigate(`/jobs/${jobId}`));
  const handleCreateJob = onCreateJob ?? (() => navigate('/jobs/create'));

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<JobFiltersState>({ mineOnly: false });

  // Debounce search query input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { jobs = [], total = 0, loading, error, refresh, mutateJob } = useJobs({
    search: debouncedSearch || undefined,
    user_id: filters.mineOnly && user ? user.id : undefined,
  });

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.status === 'published').length;
    const withImages = jobs.filter((j) => j.images && j.images.length > 0).length;
    return { published, withImages, total: total || jobs.length };
  }, [jobs, total]);

  const canCreate = isAuthenticated() && !!user;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background Ambient Blur Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[120px]" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-900/30 blur-[120px]" />
        </div>

        {/* Decorative Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 sm:px-6 lg:px-8 lg:pt-20 lg:pb-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              {/* Status Indicator Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>
                  {stats.published} live {stats.published === 1 ? 'opening' : 'openings'} available
                </span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover your next{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-white bg-clip-text text-transparent">
                  opportunity.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                Browse verified openings posted by industry professionals and technical teams across the platform.
              </p>

              {/* Search Control */}
              <div className="mt-8 max-w-xl">
                <JobSearch value={searchInput} onChange={setSearchInput} />
              </div>

              {/* Quick Metrics */}
              <div className="mt-8 flex flex-wrap gap-3">
                <StatChip
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Published"
                  value={stats.published}
                />
                <StatChip
                  icon={<ImageIcon className="h-4 w-4" />}
                  label="With images"
                  value={stats.withImages}
                />
                <StatChip
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Total jobs"
                  value={stats.total}
                />
              </div>
            </div>

            {/* Primary Call to Action */}
            {canCreate && (
              <div className="pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={handleCreateJob}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-xl transition-all hover:scale-[1.02] hover:bg-slate-100 active:scale-[0.98] dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
                >
                  <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Post a job</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-indigo-200" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-64 lg:sticky lg:top-20">
            <JobFilters
              filters={filters}
              onChange={(partial) => setFilters((f) => ({ ...f, ...partial }))}
              resultCount={jobs.length}
              canFilterMine={canCreate}
            />
          </aside>

          {/* Job Listings Grid Header & Content */}
          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  {loading
                    ? 'Fetching jobs…'
                    : debouncedSearch
                    ? `Results for "${debouncedSearch}"`
                    : 'All Job Postings'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loading
                    ? 'Updating listings in real-time'
                    : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`}
                </p>
              </div>

              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            {loading ? (
              <JobGridSkeleton />
            ) : (
              <JobGrid
                jobs={jobs}
                onOpenDetails={handleOpenDetails}
                onPatch={mutateJob}
              />
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-2.5 backdrop-blur-md">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-indigo-400">
        {icon}
      </div>
      <div>
        <div className="text-base font-bold leading-none text-white tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}