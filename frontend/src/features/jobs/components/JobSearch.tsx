import { Search, X } from 'lucide-react';

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function JobSearch({
  value,
  onChange,
  placeholder = 'Search jobs, roles, or keywords…',
}: JobSearchProps) {
  return (
    <div className="group relative w-full">
      {/* Active Ambient Glow Ring */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-indigo-500/30 opacity-0 blur-md transition-opacity duration-300 group-focus-within:opacity-100 dark:from-indigo-500/40 dark:via-violet-500/30 dark:to-indigo-500/40" />

      {/* Main Input Bar */}
      <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 group-focus-within:border-indigo-500/50 group-focus-within:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40 dark:group-focus-within:border-indigo-500/50">
        <Search className="ml-4 h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-600 dark:text-slate-500 dark:group-focus-within:text-indigo-400" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 flex-1 bg-transparent pr-2 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search input"
            className="mr-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="mr-4 hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500 sm:inline-flex">
            <span>Filter</span>
          </kbd>
        )}
      </div>
    </div>
  );
}