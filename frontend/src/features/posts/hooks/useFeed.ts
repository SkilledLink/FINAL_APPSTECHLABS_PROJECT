import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/feedApi';
import type { Post, PostListParams } from '../types/post.types';

interface UseFeedOptions extends PostListParams {
  enabled?: boolean;
}

export function useFeed(options?: UseFeedOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
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

  const fetchPosts = useCallback(
    async (params?: PostListParams) => {
      try {
        setLoading(true);
        setError(null);

        const data = await postApi.list({
          skip: params?.skip ?? skip ?? 0,
          limit: params?.limit ?? limit ?? 20,
          search: params?.search ?? search,
          hashtag: params?.hashtag ?? hashtag,
          user_id: params?.user_id ?? user_id,
          status: params?.status ?? status,
        });

        setPosts(data.items);
        setTotal(data.total);
        setPage(data.page);
        setSize(data.size);
      } catch (err: unknown) {
        const detail =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof err.response === 'object' &&
          err.response !== null &&
          'data' in err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'detail' in err.response.data &&
          typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : undefined;

        setError(detail || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    },
    [skip, limit, search, hashtag, user_id, status]
  );

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      void fetchPosts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPosts, enabled]);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  const updatePostInList = useCallback((updated: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  }, []);

  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  return {
    posts,
    loading,
    error,
    total,
    page,
    size,
    fetchPosts,
    refetch: fetchPosts,
    removePost,
    updatePostInList,
    prependPost,
    setPosts,
  };
}