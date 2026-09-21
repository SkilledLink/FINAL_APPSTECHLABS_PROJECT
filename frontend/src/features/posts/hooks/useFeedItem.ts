import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/feedApi';
import type { Post } from '../types/post.types';

export function useFeedItem(postId: string | null, enabled = true) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    // Defer state updates so callers invoked from an effect do not update
    // state synchronously during the effect's execution.
    await Promise.resolve();

    if (!postId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await postApi.getById(postId);
      setPost(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (enabled && postId) {
      const timer = setTimeout(() => {
        void fetchPost();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [enabled, postId, fetchPost]);

  return { post, loading, error, refetch: fetchPost, setPost };
}