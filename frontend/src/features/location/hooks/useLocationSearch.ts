import { useEffect, useRef, useState } from 'react';
import { locationService } from '../services/locationService';
import type { LocationSearchResult } from '../types/location.types';

export interface UseLocationSearchResult {
  results: LocationSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
}

const DEBOUNCE_MS = 500;

export function useLocationSearch(
  country?: string,
  limit = 8
): UseLocationSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await locationService.search(trimmed, limit, country);
        if (id !== requestId.current) return;
        setResults(res.results);
      } catch (err: any) {
        if (id !== requestId.current) return;
        setError(err?.message ?? 'Search failed');
        setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, country, limit]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return { results, loading, error, query, setQuery, clear };
}