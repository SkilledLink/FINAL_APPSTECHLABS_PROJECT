import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import {
  CAMEROON_CITIES,
  JOB_CATEGORIES,
  JOB_TYPES,
  type JobFilters as JobFiltersType,
  type JobStatus,
} from '../types/job.types';

interface JobFiltersProps {
  filters: JobFiltersType;
  onChange: (partial: Partial<JobFiltersType>) => void;
  resultCount: number;
}

const STATUS_OPTIONS: (JobStatus | 'All')[] = ['All', 'active', 'closed'];

export default function JobFilters({ filters, onChange, resultCount }: JobFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.location !== 'All' ? 1 : 0) +
    (filters.jobType !== 'All' ? 1 : 0) +
    (filters.status !== 'All' ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0);

  const clearAll = () => {
    onChange({ category: 'All', location: 'All', jobType: 'All', status: 'All', minSalary: 0 });
  };

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="label">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value as JobFiltersType['category'] })}
          className="input"
        >
          <option value="All">All Categories</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Location</label>
        <select
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value as JobFiltersType['location'] })}
          className="input"
        >
          <option value="All">All Cities</option>
          {CAMEROON_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Job Type</label>
        <select
          value={filters.jobType}
          onChange={(e) => onChange({ jobType: e.target.value as JobFiltersType['jobType'] })}
          className="input"
        >
          <option value="All">All Types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Status</label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ status: s })}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${filters.status === s
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-300'
                }`}
            >
              {s === 'All' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">
          Minimum Salary: {filters.minSalary > 0 ? `${Math.round(filters.minSalary / 1000)}K XAF` : 'Any'}
        </label>
        <input
          type="range"
          min={0}
          max={1000000}
          step={50000}
          value={filters.minSalary}
          onChange={(e) => onChange({ minSalary: Number(e.target.value) })}
          className="w-full accent-brand-500"
        />
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden btn-secondary w-full"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="badge bg-brand-500 text-white">{activeCount}</span>
        )}
      </button>

      <aside className="hidden lg:block w-full lg:w-64 shrink-0">
        <div className="card p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-display font-bold text-ink-900">Filters</h3>
            <span className="text-sm text-ink-400">{resultCount} jobs</span>
          </div>
          <FilterContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 animate-slide-right shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
