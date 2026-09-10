import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/feedApi';
import type { Post } from '../types/post.types';

export function useFeedItem(postId: string | null, enabled = true) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await postApi.getById(postId);
      setPost(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (enabled && postId) {
      fetchPost();
    }
  }, [enabled, postId, fetchPost]);

  return { post, loading, error, refetch: fetchPost, setPost };
}