import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../api/feedApi';
import type { Feed } from '../types/feed.types';

export function useFeedItem(feedId: string | null, enabled = true) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!feedId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await feedApi.getById(feedId);
      setFeed(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [feedId]);

  useEffect(() => {
    if (enabled && feedId) {
      fetchFeed();
    }
  }, [enabled, feedId, fetchFeed]);

  return { feed, loading, error, refetch: fetchFeed, setFeed };
}