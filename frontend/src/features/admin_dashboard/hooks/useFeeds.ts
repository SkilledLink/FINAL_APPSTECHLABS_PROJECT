import { useEffect, useState, useCallback } from 'react';
import { feedsService } from '../services/feedsService';
import type { AdminFeed, AdminFeedDetail } from '../types/admin.types';

export const useFeeds = () => {
  const [feeds, setFeeds] = useState<AdminFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFeeds(await feedsService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feeds');
    } finally {
      setLoading(false);
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
    loading,
    error,
    refetch: load,
    fetchOne,
    remove,
    removeComment,
  };
};