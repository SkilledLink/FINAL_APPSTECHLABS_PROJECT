// src/features/admin/hooks/useReports.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { reportsService } from '../services/reportsService';
import type { AdminReport, ReportReviewPayload } from '../types/admin.types';

const BATCH_SIZE = 20;

export const useReports = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
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
    setReports([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminReport[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await reportsService.getPage(
          skip,
          BATCH_SIZE,
        );

        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setReports(accumulated);
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
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchOne = useCallback((id: string) => reportsService.getOne(id), []);

  const review = useCallback(async (id: string, payload: ReportReviewPayload) => {
    const updated = await reportsService.review(id, payload);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const withdraw = useCallback(async (id: string) => {
    await reportsService.withdraw(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return {
    reports,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    fetchOne,
    review,
    withdraw,
  };
};