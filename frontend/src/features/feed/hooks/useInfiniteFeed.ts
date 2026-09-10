import { useCallback, useEffect, useRef, useState } from 'react';
import { feedApi } from '../api/feedApi';
import type { Feed, FeedListParams } from '../types/feed.types';

const DEFAULT_LIMIT = 10;

interface UseInfiniteFeedOptions extends FeedListParams {
  enabled?: boolean;
  limit?: number;
}

export function useInfiniteFeed(options?: UseInfiniteFeedOptions) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = options?.limit ?? DEFAULT_LIMIT;
  const {
    search,
    hashtag,
    user_id,
    status,
    enabled = true,
  } = options || {};

  // Track the current skip position
  const skipRef = useRef(0);
  const loadingRef = useRef(false);

  // ─── Load first page (or reset) ─────────────────────────
  const loadInitial = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      skipRef.current = 0;

      const data = await feedApi.list({
        skip: 0,
        limit,
        search,
        hashtag,
        user_id,
        status,
      });

      setFeeds(data.items);
      setHasMore(data.items.length >= limit);
      skipRef.current = data.items.length;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load feeds');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit, search, hashtag, user_id, status]);

  // ─── Load next page ────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    try {
      setLoadingMore(true);
      setError(null);

      const data = await feedApi.list({
        skip: skipRef.current,
        limit,
        search,
        hashtag,
        user_id,
        status,
      });

      if (data.items.length === 0) {
        setHasMore(false);
      } else {
        setFeeds((prev) => [...prev, ...data.items]);
        skipRef.current += data.items.length;
        setHasMore(data.items.length >= limit);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load more feeds');
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [limit, search, hashtag, user_id, status, hasMore]);

  // ─── Refresh ────────────────────────────────────────────
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  // ─── Local updates ──────────────────────────────────────
  const prependFeed = useCallback((feed: Feed) => {
    setFeeds((prev) => [feed, ...prev]);
  }, []);

  const removeFeed = useCallback((feedId: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
  }, []);

  const updateFeedInList = useCallback((updated: Feed) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
    );
  }, []);

  // Auto-load on mount or when filters change
  useEffect(() => {
    if (enabled) {
      loadInitial();
    }
  }, [enabled, loadInitial]);

  return {
    feeds,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    prependFeed,
    removeFeed,
    updateFeedInList,
    setFeeds,
  };
}