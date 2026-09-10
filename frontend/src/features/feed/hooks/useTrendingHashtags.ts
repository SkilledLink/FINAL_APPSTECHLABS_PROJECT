import { useEffect, useState } from 'react';
import { feedApi } from '../api/feedApi';
import type { Hashtag } from '../types/feed.types';

export function useTrendingHashtags(limit = 10) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await feedApi.getTrendingHashtags(limit);
        if (mounted) setHashtags(data);
      } catch (err: any) {
        if (mounted) setError(err.response?.data?.detail || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { hashtags, loading, error };
}