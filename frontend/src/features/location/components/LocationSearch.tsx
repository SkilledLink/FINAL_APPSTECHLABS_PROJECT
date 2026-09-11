import { Loader2, MapPin, Search, X } from 'lucide-react';
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
      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-colors">
        <Search className="h-4 w-4 shrink-0 text-ink-400" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(results.length > 0)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ink-400"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              clear();
              setOpen(false);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-ink-100 bg-white py-1 shadow-xl">
          {results.map((r, i) => (
            <li key={`${r.osm_type}-${r.osm_id}-${i}`}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => handleSelect(r)}
                className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  i === highlighted ? 'bg-brand-50' : 'hover:bg-ink-50'
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {r.area || r.city || r.region || r.display_name}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {r.display_name}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}