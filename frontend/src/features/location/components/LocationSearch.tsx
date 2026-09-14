import { AlertCircle, Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import type { LocationSearchResult } from '../types/location.types';

interface LocationSearchProps {
  onSelect: (result: LocationSearchResult) => void;
  country?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function LocationSearch({
  onSelect,
  country = 'cm',
  placeholder = 'Search for a location…',
  autoFocus = false,
}: LocationSearchProps) {
  const { results, loading, error, query, setQuery, clear } = useLocationSearch(
    country
  );
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(results.length > 0);
    setHighlighted(0);
  }, [results]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (r: LocationSearchResult) => {
    onSelect(r);
    setQuery(r.display_name);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Container */}
      <div className="group relative flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-1 shadow-sm transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
        <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-600 dark:text-slate-500 dark:group-focus-within:text-indigo-400" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(results.length > 0)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              clear();
              setOpen(false);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Autocomplete Dropdown Menu */}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          {results.map((r, i) => {
            const title = r.area || r.city || r.region || r.display_name;
            const isHighlighted = i === highlighted;

            return (
              <li key={`${r.osm_type}-${r.osm_id}-${i}`}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => handleSelect(r)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                    isHighlighted
                      ? 'bg-indigo-50/80 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-100'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isHighlighted
                        ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        isHighlighted
                          ? 'text-indigo-900 dark:text-indigo-100'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {title}
                    </p>
                    <p
                      className={`truncate text-xs ${
                        isHighlighted
                          ? 'text-indigo-600/80 dark:text-indigo-300/80'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {r.display_name}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}