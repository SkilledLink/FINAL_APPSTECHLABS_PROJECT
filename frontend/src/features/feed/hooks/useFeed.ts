import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../api/feedApi';
import type { Feed, FeedListParams } from '../types/feed.types';

interface UseFeedOptions extends FeedListParams {
  enabled?: boolean;
}

export function useFeed(options?: UseFeedOptions) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(options?.limit || 20);

  const {
    skip,
    limit,
    search,
    hashtag,
    user_id,
    status,
    enabled = true,
  } = options || {};

  const fetchFeeds = useCallback(
    async (params?: FeedListParams) => {
      try {
        setLoading(true);
        setError(null);

        const data = await feedApi.list({
          skip: params?.skip ?? skip ?? 0,
          limit: params?.limit ?? limit ?? 20,
          search: params?.search ?? search,
          hashtag: params?.hashtag ?? hashtag,
          user_id: params?.user_id ?? user_id,
          status: params?.status ?? status,
        });

        setFeeds((prev) => {
          const pending = prev.filter(
            (f) => f._clientStatus === 'uploading' || f._clientStatus === 'failed',
          );
          return [...pending, ...data.items];
        });
        setTotal(data.total);
        setPage(data.page);
        setSize(data.size);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load feeds');
      } finally {
        setLoading(false);
      }
    },
    [skip, limit, search, hashtag, user_id, status]
  );

  useEffect(() => {
    if (enabled) {
      fetchFeeds();
    }
  }, [fetchFeeds, enabled]);

  // ─── Local state helpers ────────────────────────────────
  const removeFeed = useCallback((feedId: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  const updateFeedInList = useCallback((updated: Feed) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
    );
  }, []);

  const prependFeed = useCallback((feed: Feed) => {
    setFeeds((prev) => [feed, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  return {
    feeds,
    loading,
    error,
    total,
    page,
    size,
    fetchFeeds,
    refetch: fetchFeeds,
    removeFeed,
    updateFeedInList,
    prependFeed,
    setFeeds,
  };
}