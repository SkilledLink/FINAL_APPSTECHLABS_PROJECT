import { useEffect, useState, useCallback, useRef } from 'react';
import { myActivityService } from '../services/myActivityService';
import type { ActivityFilters } from '../services/myActivityService';
import type { ActivityLog, ActivityLogDetail } from '../types/moderator.types';

const BATCH_SIZE = 3;

export const useMyActivity = (filters: ActivityFilters = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);
  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setLogs([]);
    setTotal(0);

    let skip = 0;
    let accumulated: ActivityLog[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await myActivityService.getPage(
          skip,
          BATCH_SIZE,
          filters,
        );

        if (runId !== runIdRef.current) return;
        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setLogs(accumulated);
        setTotal(grandTotal);

        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) setLoadingMore(true);
        }

        skip += items.length;

        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || items.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load activity');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => myActivityService.getOne(id), []);

  return {
    logs,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    fetchOne,
  };
};