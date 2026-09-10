import { Search, X } from 'lucide-react';
import type { JobFilters } from '../types/job.types';

interface JobSearchProps {
  filters: JobFilters;
  onChange: (search: string) => void;
}

export default function JobSearch({ filters, onChange }: JobSearchProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-400 pointer-events-none" />
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search jobs, skills, or companies..."
        className="input pl-11 pr-10 h-12 text-base w-full"
      />
      {filters.search && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  );
}
