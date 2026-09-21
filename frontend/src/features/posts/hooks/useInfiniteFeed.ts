import { useCallback, useEffect, useRef, useState } from 'react';
import type { AxiosError } from 'axios';
import { postApi } from '../api/feedApi';
import type { Post, PostListParams } from '../types/post.types';

const DEFAULT_LIMIT = 10;

interface UseInfiniteFeedOptions extends PostListParams {
  enabled?: boolean;
  limit?: number;
}

export function useInfiniteFeed(options?: UseInfiniteFeedOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
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

  const skipRef = useRef(0);
  const loadingRef = useRef(false);

  // ─── Load first page ────────────────────────────────────
  const loadInitial = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      skipRef.current = 0;

      const data = await postApi.list({
        skip: 0,
        limit,
        search,
        hashtag,
        user_id,
        status,
      });

      // Preserve any still-uploading or failed optimistic posts so they
      // are not wiped by a background refetch.
      setPosts((prev) => {
        const pending = prev.filter(
          (p) => p._clientStatus === 'uploading' || p._clientStatus === 'failed',
        );
        return [...pending, ...data.items];
      });

      setHasMore(data.items.length >= limit);
      skipRef.current = data.items.length;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      setError(error.response?.data?.detail || 'Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit, search, hashtag, user_id, status]);

  // ─── Load next page ─────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    try {
      setLoadingMore(true);
      setError(null);

      const data = await postApi.list({
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
        setPosts((prev) => [...prev, ...data.items]);
        skipRef.current += data.items.length;
        setHasMore(data.items.length >= limit);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      setError(error.response?.data?.detail || 'Failed to load more posts');
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
  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const updatePostInList = useCallback((updated: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  }, []);

  // ─── Optimistic helpers ─────────────────────────────────
  const replacePost = useCallback((tempId: string, realPost: Post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._tempId === tempId || p.id === tempId
          ? { ...realPost, _tempId: tempId, _clientStatus: undefined }
          : p,
      ),
    );
  }, []);

  const markPostFailed = useCallback((tempId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._tempId === tempId || p.id === tempId
          ? { ...p, _clientStatus: 'failed' as const }
          : p,
      ),
    );
  }, []);

  const markPostUploading = useCallback((tempId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._tempId === tempId || p.id === tempId
          ? { ...p, _clientStatus: 'uploading' as const }
          : p,
      ),
    );
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      void loadInitial();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [enabled, loadInitial]);

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    prependPost,
    removePost,
    updatePostInList,
    replacePost,
    markPostFailed,
    markPostUploading,
    setPosts,
  };
}