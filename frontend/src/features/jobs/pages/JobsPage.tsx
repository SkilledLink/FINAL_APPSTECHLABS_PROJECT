import { ArrowUpRight, Briefcase, ImageIcon, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../../auth/hooks/useAuth';
import JobSearch from '../components/JobSearch';
import JobFilters, { type JobFiltersState } from '../components/JobFilters';
import jobs_hero_image from '../../../assets/images/jobs_hero_image.jpeg';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <div className="w-full">
        <section className="group relative overflow-hidden border border-slate-200/70 text-white dark:border-white/10">
          {/* Hero Background Image */}
          <img
            src={jobs_hero_image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Readability Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/55" />

          {/* Background Ambient Blur Blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-96 w-96 bg-blue-600/25 blur-[120px]" />
            <div className="absolute -right-20 top-20 h-80 w-80 bg-blue-500/15 blur-[100px]" />
          </div>

          {/* Decorative Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Top Accent Bar */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 to-blue-700" />

          <div className="relative px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                {/* Live Badge */}
                <div className="inline-flex items-center gap-2.5 rounded-sm border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-blue-300 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-blue-500" />
                  </span>
                  <span>
                    {stats.published} live {stats.published === 1 ? 'opening' : 'openings'} available
                  </span>
                </div>

                <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Discover your next{' '}
                  <span className="bg-gradient-to-r from-blue-300 via-blue-100 to-white bg-clip-text text-transparent">
                    opportunity.
                  </span>
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                  Browse verified openings posted by industry professionals and technical teams across the platform.
                </p>

                {/* Search Control */}
                <div className="mt-6 max-w-xl">
                  <JobSearch value={searchInput} onChange={setSearchInput} />
                </div>

                {/* Quick Metrics */}
                <div className="mt-6 flex flex-wrap gap-2.5">
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

              {/* Primary CTA */}
              {canCreate && (
                <div className="pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={handleCreateJob}
                    className="group/btn inline-flex items-center gap-2.5 rounded-md border border-blue-500/40 bg-blue-600/90 px-5 py-3 text-sm font-semibold text-white shadow-md backdrop-blur-md transition-all hover:border-blue-400 hover:bg-blue-500 active:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 transition-transform duration-200 group-hover/btn:rotate-90" />
                    <span>Post a job</span>
                    <ArrowUpRight className="h-4 w-4 text-blue-200 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Main Content Area — full width, sidebar flush against app nav */}
      <div className="flex w-full flex-col lg:flex-row lg:items-start">
        {/* Sidebar Filters — sticky, full-height, flush to the left */}
        <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r lg:border-slate-200 dark:lg:border-white/10">
          <JobFilters
            filters={filters}
            onChange={(partial) => setFilters((f) => ({ ...f, ...partial }))}
            resultCount={jobs.length}
            canFilterMine={canCreate}
          />
        </aside>

        {/* Job Listings Grid Header & Content */}
        <main className="min-w-0 flex-1 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-200/70 bg-white/85 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:px-5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
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
              className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-md border-l-4 border-l-rose-500 border-y border-r border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-y-rose-900/50 dark:border-r-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
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
    <div className="flex items-center gap-3 rounded-sm border border-blue-500/25 bg-blue-500/10 px-3.5 py-2 backdrop-blur-md">
      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-500/15 text-blue-300">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold leading-none text-white tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-blue-200/80">
          {label}
        </div>
      </div>
    </div>
  );
}