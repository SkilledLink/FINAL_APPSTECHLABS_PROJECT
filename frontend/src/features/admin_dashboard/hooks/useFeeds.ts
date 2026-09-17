import { useEffect, useState, useCallback, useRef } from 'react';
import { feedsService } from '../services/feedsService';
import type { AdminFeed, AdminFeedDetail } from '../types/admin.types';

/**
 * How many feeds to request per page. Small enough that the first batch
 * shows up almost instantly, large enough to avoid an absurd number of
 * round-trips for a full list of 100.
 */
const BATCH_SIZE = 3;

export const useFeeds = () => {
  const [feeds, setFeeds] = useState<AdminFeed[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);           // first batch pending
  const [loadingMore, setLoadingMore] = useState(false);  // later batches pending
  const [error, setError] = useState<string | null>(null);

  // Incremented on every `load()` call so stale in-flight loops
  // (from an old refetch) bail out instead of clobbering fresh state.
  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setFeeds([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminFeed[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return; // a newer load superseded us

        const { items, total: t } = await feedsService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;

        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setFeeds(accumulated);
        setTotal(grandTotal);

        // First batch has landed — stop showing the full-page skeleton
        // and start rendering content while the rest streams in.
        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) {
            setLoadingMore(true);
          }
        }

        skip += items.length;

        // Done when we've pulled everything, or the server returned
        // fewer items than requested (i.e. that was the last page).
        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || items.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load feeds');
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
    (id: string) => feedsService.getOne(id),
    [],
  );

  const remove = useCallback(
    async (id: string, reason: string, hard = false) => {
      await feedsService.remove(id, reason, hard);
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'removed', isDeleted: true } : f,
        ),
      );
    },
    [],
  );

  const removeComment = useCallback(
    async (feedId: string, commentId: string, reason: string) => {
      await feedsService.removeComment(commentId, reason);
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feedId
            ? { ...f, comments: Math.max(0, f.comments - 1) }
            : f,
        ),
      );
    },
    [],
  );

  return {
    feeds,
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