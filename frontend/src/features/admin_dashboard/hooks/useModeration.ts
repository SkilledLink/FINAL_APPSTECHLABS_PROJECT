import { useEffect, useState, useCallback, useRef } from 'react';
import { moderationService } from '../services/moderationService';
import type { ModerationQueueItem, ModerationDetail } from '../types/admin.types';

const BATCH_SIZE = 5;

export const useModeration = () => {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
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
    setItems([]);
    setTotal(0);

    let skip = 0;
    let accumulated: ModerationQueueItem[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items: batch, total: t } = await moderationService.getQueuePage(
          skip,
          BATCH_SIZE,
        );

        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;
        if (batch.length === 0) break;

        accumulated = accumulated.concat(batch);
        setItems(accumulated);
        setTotal(grandTotal);

        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) setLoadingMore(true);
        }

        skip += batch.length;

        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || batch.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load moderation queue');
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

  const fetchOne = useCallback(
    (id: string) => moderationService.getRecord(id),
    [],
  );

  const approve = useCallback(async (recordId: string, reason: string) => {
    await moderationService.approve(recordId, reason);
    setItems((prev) => prev.filter((i) => i.recordId !== recordId));
  }, []);

  const reject = useCallback(async (recordId: string, reason: string) => {
    await moderationService.reject(recordId, reason);
    setItems((prev) => prev.filter((i) => i.recordId !== recordId));
  }, []);

  return {
    items,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    fetchOne,
    approve,
    reject,
  };
};