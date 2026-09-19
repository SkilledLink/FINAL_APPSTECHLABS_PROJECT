import { useEffect, useState, useCallback, useRef } from 'react';
import { feedsService } from '../services/feedsService';
import type { AdminFeed, AdminFeedDetail } from '../types/moderator.types';

const BATCH_SIZE = 3;

export const useFeeds = () => {
  const [feeds, setFeeds] = useState<AdminFeed[]>([]);
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
    setFeeds([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminFeed[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await feedsService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;
        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setFeeds(accumulated);
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
      setError(e instanceof Error ? e.message : 'Failed to load feeds');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => feedsService.getOne(id), []);

  const remove = useCallback(async (id: string, reason: string) => {
    await feedsService.remove(id, reason);
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'removed', isDeleted: true } : f,
      ),
    );
  }, []);

  const removeComment = useCallback(
    async (feedId: string, commentId: string, reason: string) => {
      await feedsService.removeComment(commentId, reason);
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feedId ? { ...f, comments: Math.max(0, f.comments - 1) } : f,
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