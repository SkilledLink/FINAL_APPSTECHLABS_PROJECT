import { Briefcase, TrendingUp, Users, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobsProvider, useJobs } from '../hooks/useJobs';
import JobSearch from '../components/JobSearch';
import JobFilters from '../components/JobFilters';
import JobGrid, { JobGridSkeleton } from '../components/JobGrid';

interface JobsPageProps {
  onOpenDetails?: (jobId: string) => void;
}

function JobsPageContent({ onOpenDetails }: JobsPageProps) {
  const navigate = useNavigate();
  const { filteredJobs, loading, filters, setFilters, jobs } = useJobs();

  // Fallback to React Router navigation if no custom handler is provided
  const handleOpenDetails = onOpenDetails ?? ((jobId: string) => navigate(`/jobs/${jobId}`));

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.status === 'active').length;
    const cities = new Set(jobs.map((j) => j.location)).size;
    const companies = new Set(jobs.map((j) => j.poster.company)).size;
    return { active, cities, companies, total: jobs.length };
  }, [jobs]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(22,168,95,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(249,115,22,0.15) 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-brand-200 ring-1 ring-white/15 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              {stats.active} active jobs across Cameroon
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-balance">
              Find your next opportunity in Cameroon
            </h1>
            <p className="mt-4 text-lg text-ink-300 max-w-xl">
              Browse jobs from leading companies in Douala, Yaoundé, Buea, and beyond. From tech to trades, your next role is here.
            </p>
          </div>

          <div className="mt-8 max-w-2xl">
            <JobSearch filters={filters} onChange={(search) => setFilters({ search })} />
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <StatCard icon={<Briefcase className="w-4 h-4" />} label="Active Jobs" value={stats.active} />
            <StatCard icon={<Users className="w-4 h-4" />} label="Companies" value={stats.companies} />
            <StatCard icon={<MapPin className="w-4 h-4" />} label="Cities" value={stats.cities} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Posts" value={stats.total} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <JobFilters filters={filters} onChange={setFilters} resultCount={filteredJobs.length} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg sm:text-xl text-ink-900">
                {loading ? 'Loading jobs...' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
              </h2>
            </div>
            {loading ? (
              <JobGridSkeleton />
            ) : (
              <JobGrid jobs={filteredJobs} onOpenDetails={handleOpenDetails} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage(props: JobsPageProps) {
  return (
    <JobsProvider>
      <JobsPageContent {...props} />
    </JobsProvider>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 px-4 py-3">
      <div className="flex items-center gap-2 text-brand-200 mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-ink-400">{label}</div>
    </div>
  );
}