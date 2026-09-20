import { useEffect, useState } from 'react';
import { postApi } from '../api/feedApi';
import type { Hashtag } from '../types/post.types';

export function useTrendingHashtags(limit = 10) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await postApi.getTrendingHashtags(limit);
        if (mounted) setHashtags(data);
      } catch (err: unknown) {
        if (mounted) {
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
              : null;
          setError(detail || 'Failed to load hashtags');
        }
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