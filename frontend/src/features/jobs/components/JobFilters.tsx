import {
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface JobFiltersState {
  mineOnly: boolean;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onChange: (partial: Partial<JobFiltersState>) => void;
  resultCount: number;
  canFilterMine: boolean;
}

export default function JobFilters({
  filters,
  onChange,
  resultCount,
  canFilterMine,
}: JobFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamic calculation for scalable filter expansion
  const activeCount = Object.values(filters).filter(Boolean).length;

  // Prevent background scrolling & support Escape key closure for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const handleResetFilters = () => {
    onChange({ mineOnly: false });
  };

  const renderFilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Scope</span>
        </div>

        {canFilterMine ? (
          <button
            type="button"
            onClick={() => onChange({ mineOnly: !filters.mineOnly })}
            className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 select-none ${
              filters.mineOnly
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 dark:bg-indigo-600 dark:text-white dark:shadow-indigo-600/20'
                : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4" />
              <span>{filters.mineOnly ? 'My jobs only' : 'Show my jobs only'}</span>
            </div>
            {filters.mineOnly && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Sign in to filter by your posts.
            </p>
          </div>
        )}
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset filter</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 transition-all active:scale-95"
        aria-expanded={mobileOpen}
        aria-controls="mobile-filter-drawer"
      >
        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
              Refine Search
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1">
              {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
            </span>
          </div>
          {renderFilterContent()}
        </div>
      </aside>

      {/* Mobile Drawer Portal */}
      {mobileOpen &&
        createPortal(
          <div
            id="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Job filters"
            className="lg:hidden fixed inset-0 z-[99999] flex"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-over Panel */}
            <div className="relative ml-auto w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                      Filters
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    aria-label="Close filters drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {renderFilterContent()}
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                >
                  Apply Filters ({resultCount})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}