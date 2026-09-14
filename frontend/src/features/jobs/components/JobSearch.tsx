import { Search, X } from 'lucide-react';

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function JobSearch({
  value,
  onChange,
  placeholder = 'Search jobs, roles, or keywords…',
  className = '',
}: JobSearchProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Input Bar */}
      <div className="group relative flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 shadow-xs transition-colors focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500">
        <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-600 dark:text-slate-500 dark:group-focus-within:text-indigo-400" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search input"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500 sm:inline-flex">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        )}
      </div>
    </div>
  );
}