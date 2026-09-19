import { useEffect, useState, useCallback, useRef } from 'react';
import { jobsService } from '../services/jobsService';
import type { AdminJob, AdminJobDetail } from '../types/moderator.types';

const BATCH_SIZE = 3;

export const useJobs = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setJobs([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminJob[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await jobsService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;
        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setJobs(accumulated);
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
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => jobsService.getOne(id), []);

  const remove = useCallback(async (id: string, reason: string) => {
    await jobsService.remove(id, reason);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const removeComment = useCallback(
    async (jobId: string, commentId: string, reason: string) => {
      await jobsService.removeComment(commentId, reason);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, comments: Math.max(0, j.comments - 1) } : j,
        ),
      );
    },
    [],
  );

  return {
    jobs,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    fetchOne,
    remove,
    removeComment,
  };
};