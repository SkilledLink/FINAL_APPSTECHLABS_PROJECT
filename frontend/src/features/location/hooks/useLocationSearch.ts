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

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

export function useLocationSearch(
  country?: string,
  limit = 8
): UseLocationSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Guards against out-of-order responses */
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      const id = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const res = await locationService.search(trimmed, limit, country);
        if (id !== requestIdRef.current) return;
        setResults(res.results ?? []);
      } catch (err: any) {
        if (id !== requestIdRef.current) return;
        setError(err?.message ?? 'Search failed');
        setResults([]);
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      /* Invalidate any in-flight response so it doesn't overwrite a newer one */
      requestIdRef.current++;
    };
  }, [query, country, limit]);

  const clear = () => {
    requestIdRef.current++;
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
  };

  return { results, loading, error, query, setQuery, clear };
}